'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

// 그리드 설정 (mm 기준)
const GRID_SIZE_MM = 2.5; // 2.5mm 단위 정사각형 그리드

// PDF 렌더링과 동일한 기준 너비 (pdf-generator.ts와 일치해야 함)
const RENDER_WIDTH = 400;

export function CenterPanel() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    templates,
    selectedTemplateId,
    persons,
    textFields,
    selectedTextFieldId,
    roleMappings,
    roleColors,
    templateColumn,
    templateMode,
    designMode,
    exportConfig,
    selectedSampleIndex,
    setSelectedSampleIndex,
    setSelectedTextField,
    updateTextFieldPosition,
    setTextPosition,
    setExportConfig,
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // 그리드 스냅은 항상 활성화
  const snapToGrid = true;

  // 컨테이너 크기 감지
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // 현재 템플릿의 원본 크기 가져오기
  const getOriginalTemplateSize = useCallback(() => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template && template.id !== 'default-template') {
      return { width: template.width, height: template.height };
    }
    // 기본 템플릿이나 없는 경우 기본값
    return { width: 400, height: 240 };
  }, [templates, selectedTemplateId]);

  // 프리뷰 크기 계산 (원본 해상도 유지, 컨테이너에 맞춰 자동 조절)
  const getPreviewDimensions = useCallback(() => {
    const padding = 32;
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;

    if (availableWidth <= 0 || availableHeight <= 0) {
      return { width: 300, height: 200 };
    }

    // 원본 템플릿 크기 가져오기
    const originalSize = getOriginalTemplateSize();
    const aspectRatio = originalSize.width / originalSize.height;

    // 컨테이너에 fit-contain으로 맞추기 (최대 크기 제한 없음)
    let width: number;
    let height: number;

    // 가로 기준으로 맞출 때의 높이
    const heightIfFitWidth = availableWidth / aspectRatio;

    if (heightIfFitWidth <= availableHeight) {
      // 가로에 맞추기
      width = availableWidth;
      height = width / aspectRatio;
    } else {
      // 세로에 맞추기
      height = availableHeight;
      width = height * aspectRatio;
    }

    // 원본 크기보다 크게 확대하지 않음 (선명도 유지)
    if (width > originalSize.width || height > originalSize.height) {
      width = originalSize.width;
      height = originalSize.height;
    }

    return { width, height };
  }, [containerSize, getOriginalTemplateSize]);

  // mm 기준 그리드 계산
  const gridStepX = (GRID_SIZE_MM / exportConfig.fixedWidth) * 100; // X축 그리드 간격 (%)
  const gridStepY = (GRID_SIZE_MM / exportConfig.fixedHeight) * 100; // Y축 그리드 간격 (%)

  // 방향키로 텍스트 필드 이동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTextFieldId) return;

      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (!arrowKeys.includes(e.key)) return;

      e.preventDefault();

      const selectedField = textFields.find(f => f.id === selectedTextFieldId);
      if (!selectedField) return;

      // 그리드 모드면 그리드 단위, 아니면 1%
      const stepX = snapToGrid ? gridStepX : 1;
      const stepY = snapToGrid ? gridStepY : 1;

      let newX = selectedField.position.x;
      let newY = selectedField.position.y;

      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, newY - stepY);
          break;
        case 'ArrowDown':
          newY = Math.min(100, newY + stepY);
          break;
        case 'ArrowLeft':
          newX = Math.max(0, newX - stepX);
          break;
        case 'ArrowRight':
          newX = Math.min(100, newX + stepX);
          break;
      }

      updateTextFieldPosition(selectedTextFieldId, newX, newY);
      setTextPosition(newX, newY);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextFieldId, textFields, snapToGrid, gridStepX, gridStepY, updateTextFieldPosition, setTextPosition]);

  const currentPerson = persons.length > 0
    ? persons[selectedSampleIndex % persons.length]
    : null;

  // 현재 표시할 템플릿 찾기
  const getCurrentTemplate = () => {
    if (templates.length === 0) return null;

    // 명단이 있고 역할 매핑이 있으면 역할에 맞는 템플릿 사용
    if (currentPerson && templateColumn) {
      const roleValue = currentPerson.data[templateColumn];
      if (roleValue && roleMappings[roleValue]) {
        const mappedTemplate = templates.find(t => t.id === roleMappings[roleValue]);
        if (mappedTemplate) return mappedTemplate;
      }
    }

    // 선택된 템플릿 사용
    if (selectedTemplateId) {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (selectedTemplate) return selectedTemplate;
    }

    // 기본값: 첫 번째 템플릿
    return templates[0];
  };

  const currentTemplate = getCurrentTemplate();

  // 기본 템플릿 여부 확인
  const isDefaultTemplate = currentTemplate?.id === 'default-template';

  // 기본 템플릿 헤더 색상 결정 (역할별 색상 모드일 때)
  const getDefaultTemplateHeaderColor = () => {
    if (!isDefaultTemplate) return '#3b82f6';
    if (designMode !== 'default' || templateMode !== 'multi') return '#3b82f6';
    if (!currentPerson || !templateColumn) return '#3b82f6';

    const roleValue = currentPerson.data[templateColumn];
    if (roleValue && roleColors[roleValue]) {
      return roleColors[roleValue];
    }
    return '#3b82f6'; // 기본 파란색
  };

  const headerColor = getDefaultTemplateHeaderColor();

  // 미리보기 비율 계산 (고정 크기 모드면 고정 크기 사용)
  const getPreviewAspectRatio = () => {
    if (exportConfig.sizeMode === 'fixed') {
      return `${exportConfig.fixedWidth}/${exportConfig.fixedHeight}`;
    }
    if (currentTemplate) {
      return `${currentTemplate.width}/${currentTemplate.height}`;
    }
    return '4/3';
  };

  // 배경 사이즈 계산 (업로드 템플릿 + 고정 크기일 때만 스케일)
  const getBackgroundSize = () => {
    if (exportConfig.sizeMode === 'fixed' && !isDefaultTemplate) {
      return '100% 100%';
    }
    return 'cover';
  };

  // 프리뷰에 표시할 이름 (첫 번째 텍스트 필드의 값)
  const previewName = currentPerson && textFields.length > 0
    ? currentPerson.data[textFields[0].column] || 'Example'
    : 'Example Name';

  // 그리드에 스냅하는 함수 (X, Y 별도)
  const snapToGridX = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    const nearestGrid = Math.round(value / gridStepX) * gridStepX;
    return nearestGrid;
  }, [snapToGrid, gridStepX]);

  const snapToGridY = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    const nearestGrid = Math.round(value / gridStepY) * gridStepY;
    return nearestGrid;
  }, [snapToGrid, gridStepY]);

  const handleDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, fieldId: string, offset: { x: number; y: number }) => {
      if (!canvasContainerRef.current || !fieldId) return;

      const rect = canvasContainerRef.current.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = ((clientX - rect.left) / rect.width) * 100 - offset.x;
      const y = ((clientY - rect.top) / rect.height) * 100 - offset.y;

      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      // 그리드 스냅 적용 (X, Y 별도)
      const snappedX = snapToGridX(clampedX);
      const snappedY = snapToGridY(clampedY);

      updateTextFieldPosition(fieldId, snappedX, snappedY);
      setTextPosition(snappedX, snappedY);
    },
    [updateTextFieldPosition, setTextPosition, snapToGridX, snapToGridY]
  );

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedTextField(fieldId);
    setDraggingFieldId(fieldId);
    setIsDragging(true);

    // 클릭 위치와 텍스트 필드 중심 간의 오프셋 계산
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const field = textFields.find(f => f.id === fieldId);
      if (field) {
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
        const offsetX = mouseX - field.position.x;
        const offsetY = mouseY - field.position.y;
        setDragOffset({ x: offsetX, y: offsetY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggingFieldId && e.buttons === 1) {
      handleDrag(e, draggingFieldId, dragOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingFieldId(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // 텍스트 필드가 아닌 곳 클릭 시 선택 해제
    // (텍스트 필드는 stopPropagation으로 이 핸들러에 도달하지 않음)
    setSelectedTextField(null);
  };

  const handlePrev = () => {
    setSelectedSampleIndex(Math.max(0, selectedSampleIndex - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(templates.length, persons.length) - 1;
    setSelectedSampleIndex(Math.min(maxIndex, selectedSampleIndex + 1));
  };

  // 그리드 라인 생성 (정사각형 mm 기준)
  const verticalGridLines: number[] = [];
  const horizontalGridLines: number[] = [];

  // 세로선 (X축 방향으로 5mm 간격)
  for (let mm = GRID_SIZE_MM; mm < exportConfig.fixedWidth; mm += GRID_SIZE_MM) {
    verticalGridLines.push((mm / exportConfig.fixedWidth) * 100);
  }

  // 가로선 (Y축 방향으로 5mm 간격)
  for (let mm = GRID_SIZE_MM; mm < exportConfig.fixedHeight; mm += GRID_SIZE_MM) {
    horizontalGridLines.push((mm / exportConfig.fixedHeight) * 100);
  }

  return (
    <div className="h-full flex flex-col bg-slate-200 p-4 lg:p-8 items-center overflow-hidden">
      {/* Size Settings Bar */}
      {(() => {
        // 기본값 계산: 내 디자인 모드면 첫 번째 커스텀 템플릿 크기, 아니면 90x55
        const getDefaultDimensions = () => {
          if (designMode === 'custom') {
            const customTemplate = templates.find(t => t.id !== 'default-template');
            if (customTemplate) {
              // 픽셀을 mm로 변환 (10px = 1mm 기준, 최대 150mm 제한)
              // 원본 비율을 정확히 유지하기 위해 비율 기반 계산
              const scale = 0.1;
              const maxDimension = 150;
              const minDimension = 20;
              const aspectRatio = customTemplate.width / customTemplate.height;

              let width = customTemplate.width * scale;
              let height = customTemplate.height * scale;

              // 최대 크기 제한 (비율 유지)
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  width = maxDimension;
                  height = width / aspectRatio;
                } else {
                  height = maxDimension;
                  width = height * aspectRatio;
                }
              }

              // 최소 크기 보장 (비율 유지)
              if (width < minDimension || height < minDimension) {
                if (width < height) {
                  width = minDimension;
                  height = width / aspectRatio;
                } else {
                  height = minDimension;
                  width = height * aspectRatio;
                }
              }

              // 소수점 첫째 자리까지 유지 (비율 보존)
              width = Math.round(width * 10) / 10;
              height = Math.round(height * 10) / 10;

              return { width, height };
            }
          }
          return { width: 90, height: 55 };
        };
        const defaultDimensions = getDefaultDimensions();
        const isChanged = exportConfig.fixedWidth !== defaultDimensions.width || exportConfig.fixedHeight !== defaultDimensions.height;
        return (
          <div className="mb-4 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2.5 rounded-xl shadow-sm shrink-0">
            <span className="text-xs font-medium text-slate-500">명찰 크기</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="20"
                max="200"
                step="0.1"
                value={exportConfig.fixedWidth}
                onChange={(e) => setExportConfig({ fixedWidth: parseFloat(e.target.value) || 90, sizeMode: 'fixed' })}
                className="w-14 border border-slate-200 rounded px-2 py-1 text-xs text-center bg-white"
              />
              <span className="text-xs text-slate-400">×</span>
              <input
                type="number"
                min="20"
                max="200"
                step="0.1"
                value={exportConfig.fixedHeight}
                onChange={(e) => setExportConfig({ fixedHeight: parseFloat(e.target.value) || 55, sizeMode: 'fixed' })}
                className="w-14 border border-slate-200 rounded px-2 py-1 text-xs text-center bg-white"
              />
              <span className="text-xs text-slate-400">mm</span>
            </div>
            <button
              onClick={() => setExportConfig({ sizeMode: 'grid', fixedWidth: defaultDimensions.width, fixedHeight: defaultDimensions.height })}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${
                isChanged
                  ? 'text-blue-500 bg-blue-50 hover:bg-blue-100'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              기본값
            </button>
          </div>
        );
      })()}

      {/* Preview selector */}
      <div className="mb-4 flex items-center gap-4 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm shrink-0">
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-slate-100 rounded"
          disabled={selectedSampleIndex === 0}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold w-40 text-center truncate">
          Preview: {previewName}
        </span>
        <button
          onClick={handleNext}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Canvas Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full min-h-0 flex items-center justify-center"
        onClick={(e) => {
          // 컨테이너 직접 클릭 시 선택 해제
          if (e.target === e.currentTarget) {
            setSelectedTextField(null);
          }
        }}
      >
        {/* Canvas */}
        <div
          ref={canvasContainerRef}
          className="relative bg-white shadow-2xl transition-all select-none shrink-0 rounded-lg overflow-hidden"
          style={{
            width: `${getPreviewDimensions().width}px`,
            height: `${getPreviewDimensions().height}px`,
            backgroundImage: currentTemplate && !isDefaultTemplate
              ? `url(${currentTemplate.dataUrl || currentTemplate.imageUrl})`
              : 'none',
            backgroundSize: getBackgroundSize(),
            backgroundPosition: 'center',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
        {/* 기본 템플릿 HTML 렌더링 */}
        {isDefaultTemplate && (
          <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 pointer-events-none">
            {/* 테두리 */}
            <div className="absolute inset-[3%] border-2 border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden">
              {/* 상단 헤더 - 역할별 색상 적용 */}
              <div
                className="py-[8%] flex items-center justify-center transition-colors"
                style={{ backgroundColor: headerColor }}
              >
                <span className="text-white font-bold text-[clamp(10px,4vw,18px)] tracking-wide">NAME TAG</span>
              </div>
              {/* 하단 정보 영역 */}
              <div className="flex-1 flex flex-col items-center justify-end pb-[6%]">
                <div className="w-[80%] border-t-2 border-slate-200 mb-[4%]" />
                <span className="text-slate-400 text-[clamp(8px,2.5vw,12px)]">Company / Organization</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid overlay - 드래그 중에만 표시 */}
        {isDragging && snapToGrid && currentTemplate && (
          <div className="absolute inset-0 pointer-events-none z-30 animate-fade-in">
            {/* Vertical lines */}
            {verticalGridLines.map((pos, idx) => (
              <div
                key={`v-${idx}`}
                className={`absolute top-0 bottom-0 ${
                  Math.abs(pos - 50) < 1 ? 'bg-blue-400/40 w-[1.5px]' : 'bg-slate-300/40 w-px'
                }`}
                style={{ left: `${pos}%` }}
              />
            ))}
            {/* Horizontal lines */}
            {horizontalGridLines.map((pos, idx) => (
              <div
                key={`h-${idx}`}
                className={`absolute left-0 right-0 ${
                  Math.abs(pos - 50) < 1 ? 'bg-blue-400/40 h-[1.5px]' : 'bg-slate-300/40 h-px'
                }`}
                style={{ top: `${pos}%` }}
              />
            ))}
            {/* Center crosshair highlight */}
            <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 border border-blue-400 rounded-full bg-blue-400/20" />
          </div>
        )}

        {!currentTemplate && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4 border-4 border-dashed border-slate-300 m-4 rounded-xl">
            <Upload size={48} />
            <p className="font-bold">Upload a template to start</p>
          </div>
        )}

        {/* Render all text fields */}
        {currentTemplate && textFields.map((field) => {
          const isSelected = field.id === selectedTextFieldId;
          const isBeingDragged = field.id === draggingFieldId;
          const value = currentPerson?.data[field.column] || field.column;
          // PDF와 동일한 비율로 폰트 크기 스케일링 (RENDER_WIDTH=400 기준)
          const previewWidth = getPreviewDimensions().width;
          const scaledFontSize = field.style.fontSize * (previewWidth / RENDER_WIDTH);

          return (
            <div
              key={field.id}
              className={`absolute text-center transition-all ${isSelected ? 'z-20' : 'z-10'} ${isBeingDragged ? 'z-25' : ''}`}
              style={{
                left: `${field.position.x}%`,
                top: `${field.position.y}%`,
                transform: 'translate(-50%, -50%)',
                color: field.style.color,
                fontSize: `${scaledFontSize}px`,
                fontFamily: field.style.fontFamily,
                fontWeight: field.style.fontWeight,
                width: '100%',
                lineHeight: 1.2,
                textShadow: field.style.color === '#FFFFFF'
                  ? '0 1px 2px rgba(0,0,0,0.3)'
                  : 'none',
                cursor: 'move',
                userSelect: 'none',
              }}
              onMouseDown={(e) => handleMouseDown(e, field.id)}
              onTouchStart={(e) => {
                e.stopPropagation();
                setSelectedTextField(field.id);
                setDraggingFieldId(field.id);
                setIsDragging(true);

                // 터치 위치와 텍스트 필드 중심 간의 오프셋 계산
                if (canvasContainerRef.current) {
                  const rect = canvasContainerRef.current.getBoundingClientRect();
                  const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                  const touchY = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
                  const offsetX = touchX - field.position.x;
                  const offsetY = touchY - field.position.y;
                  setDragOffset({ x: offsetX, y: offsetY });
                }
              }}
              onTouchMove={(e) => {
                if (draggingFieldId === field.id) {
                  handleDrag(e, field.id, dragOffset);
                }
              }}
              onTouchEnd={() => {
                setIsDragging(false);
                setDraggingFieldId(null);
              }}
            >
              {value}
              {/* Selection indicator - 모서리 핸들만 표시 */}
              {isSelected && (
                <>
                  {/* 좌상단 */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-sm pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }} />
                  {/* 우상단 */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-sm pointer-events-none" style={{ transform: 'translate(50%, -50%)' }} />
                  {/* 좌하단 */}
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-sm pointer-events-none" style={{ transform: 'translate(-50%, 50%)' }} />
                  {/* 우하단 */}
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-sm pointer-events-none" style={{ transform: 'translate(50%, 50%)' }} />
                </>
              )}
            </div>
          );
        })}

        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-slate-500 font-medium text-center shrink-0">
        {textFields.length > 0 ? (
          <>
            클릭하여 텍스트 필드를 선택하고, 드래그하여 위치를 조정하세요.
            <span className="text-blue-500 ml-1">({GRID_SIZE_MM}mm 그리드 스냅)</span>
            <br />
            <span className="text-slate-400">
              {selectedTextFieldId && textFields.find(f => f.id === selectedTextFieldId) && (
                <>
                  선택: {textFields.find(f => f.id === selectedTextFieldId)!.column} ·
                  X {(textFields.find(f => f.id === selectedTextFieldId)!.position.x * exportConfig.fixedWidth / 100).toFixed(1)}mm,
                  Y {(exportConfig.fixedHeight - textFields.find(f => f.id === selectedTextFieldId)!.position.y * exportConfig.fixedHeight / 100).toFixed(1)}mm
                </>
              )}
            </span>
          </>
        ) : (
          <>
            Drag to position the name. Use the sidebar to style and layout.
          </>
        )}
      </div>
    </div>
  );
}
