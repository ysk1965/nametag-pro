'use client';

import { useRef, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

// 그리드 설정
const GRID_SIZE = 5; // 5% 단위 그리드
const SNAP_THRESHOLD = 2; // 2% 이내면 스냅

export function CenterPanel() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const {
    templates,
    selectedTemplateId,
    persons,
    textFields,
    selectedTextFieldId,
    roleMappings,
    templateColumn,
    exportConfig,
    selectedSampleIndex,
    setSelectedSampleIndex,
    setSelectedTextField,
    updateTextFieldPosition,
    setTextPosition,
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

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

  // 그리드에 스냅하는 함수
  const snapToGridValue = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    const nearestGrid = Math.round(value / GRID_SIZE) * GRID_SIZE;
    if (Math.abs(value - nearestGrid) <= SNAP_THRESHOLD) {
      return nearestGrid;
    }
    return value;
  }, [snapToGrid]);

  const handleDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, fieldId: string) => {
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

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      // 그리드 스냅 적용
      const snappedX = snapToGridValue(clampedX);
      const snappedY = snapToGridValue(clampedY);

      updateTextFieldPosition(fieldId, snappedX, snappedY);
      setTextPosition(snappedX, snappedY);
    },
    [updateTextFieldPosition, setTextPosition, snapToGridValue]
  );

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedTextField(fieldId);
    setDraggingFieldId(fieldId);
    setIsDragging(true);
    handleDrag(e, fieldId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggingFieldId && e.buttons === 1) {
      handleDrag(e, draggingFieldId);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingFieldId(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // 캔버스 빈 공간 클릭 시 선택 해제
    if (e.target === canvasContainerRef.current) {
      setSelectedTextField(null);
    }
  };

  const handlePrev = () => {
    setSelectedSampleIndex(Math.max(0, selectedSampleIndex - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(templates.length, persons.length) - 1;
    setSelectedSampleIndex(Math.min(maxIndex, selectedSampleIndex + 1));
  };

  // 그리드 라인 생성
  const gridLines = [];
  for (let i = GRID_SIZE; i < 100; i += GRID_SIZE) {
    gridLines.push(i);
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-200 p-4 lg:p-8 items-center justify-center overflow-auto relative">
      {/* Size indicator */}
      {exportConfig.sizeMode === 'fixed' && (
        <div className="mb-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          고정 크기: {exportConfig.fixedWidth} × {exportConfig.fixedHeight} mm
        </div>
      )}

      {/* Preview selector */}
      <div className={`${exportConfig.sizeMode === 'fixed' ? 'mb-4' : 'mb-6'} flex items-center gap-4 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm`}>
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

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        className="relative bg-white shadow-2xl transition-all select-none shrink-0 rounded-lg overflow-hidden"
        style={{
          width: '400px',
          aspectRatio: getPreviewAspectRatio(),
          maxWidth: '100%',
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
          <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
            {/* 테두리 */}
            <div className="absolute inset-[3%] border-2 border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden">
              {/* 상단 헤더 */}
              <div className="bg-blue-500 py-[8%] flex items-center justify-center">
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
        {isDragging && currentTemplate && (
          <div className="absolute inset-0 pointer-events-none z-30 animate-fade-in">
            {/* Vertical lines */}
            {gridLines.map((pos) => (
              <div
                key={`v-${pos}`}
                className={`absolute top-0 bottom-0 transition-opacity ${
                  pos === 50 ? 'bg-blue-500/50 w-[2px]' : 'bg-black/20 w-px'
                }`}
                style={{ left: `${pos}%` }}
              />
            ))}
            {/* Horizontal lines */}
            {gridLines.map((pos) => (
              <div
                key={`h-${pos}`}
                className={`absolute left-0 right-0 transition-opacity ${
                  pos === 50 ? 'bg-blue-500/50 h-[2px]' : 'bg-black/20 h-px'
                }`}
                style={{ top: `${pos}%` }}
              />
            ))}
            {/* Center crosshair highlight */}
            <div className="absolute left-1/2 top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500 rounded-full bg-blue-500/20" />
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

          return (
            <div
              key={field.id}
              className={`absolute text-center transition-all ${isSelected ? 'z-20' : 'z-10'} ${isBeingDragged ? 'z-25' : ''}`}
              style={{
                left: `${field.position.x}%`,
                top: `${field.position.y}%`,
                transform: 'translate(-50%, -50%)',
                color: field.style.color,
                fontSize: `${field.style.fontSize}px`,
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
                handleDrag(e, field.id);
              }}
              onTouchMove={(e) => {
                if (draggingFieldId === field.id) {
                  handleDrag(e, field.id);
                }
              }}
              onTouchEnd={() => {
                setIsDragging(false);
                setDraggingFieldId(null);
              }}
            >
              {value}
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute inset-0 border-2 border-blue-500 border-dashed rounded pointer-events-none"
                  style={{
                    margin: '-4px',
                    padding: '4px',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Position indicator for selected field */}
        {currentTemplate && selectedTextFieldId && textFields.find(f => f.id === selectedTextFieldId) && (
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg pointer-events-none z-20"
            style={{
              left: `${textFields.find(f => f.id === selectedTextFieldId)!.position.x}%`,
              top: `${textFields.find(f => f.id === selectedTextFieldId)!.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-xs text-slate-500 font-medium text-center">
        {textFields.length > 0 ? (
          <>
            클릭하여 텍스트 필드를 선택하고, 드래그하여 위치를 조정하세요.
            <span className="text-blue-500 ml-1">(5% 그리드 스냅)</span>
            <br />
            <span className="text-slate-400">
              {selectedTextFieldId && textFields.find(f => f.id === selectedTextFieldId) && (
                <>
                  선택: {textFields.find(f => f.id === selectedTextFieldId)!.column} ·
                  X {textFields.find(f => f.id === selectedTextFieldId)!.position.x.toFixed(1)}%,
                  Y {textFields.find(f => f.id === selectedTextFieldId)!.position.y.toFixed(1)}%
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
