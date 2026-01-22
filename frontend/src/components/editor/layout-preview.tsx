'use client';

import { useMemo } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { PAPER_SIZES } from '@/lib/utils';

// PDF 렌더링과 동일한 기준 너비 (pdf-generator.ts와 일치해야 함)
const RENDER_WIDTH = 400;

export function LayoutPreview() {
  const {
    templates,
    persons,
    exportConfig,
    textFields,
    selectedTemplateId,
    templateColumn,
    roleMappings,
    roleColors,
    templateMode,
    designMode,
  } = useEditorStore();

  // 선택된 템플릿 또는 첫 번째 템플릿 사용 (레이아웃 계산용)
  const defaultTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // 사람별 템플릿 가져오기 함수
  const getTemplateForPerson = (person: typeof persons[0] | undefined) => {
    if (!person || !templateColumn) return defaultTemplate;

    const role = person.data[templateColumn];
    if (!role) return defaultTemplate;

    // 역할에 매핑된 템플릿 찾기
    const mappedTemplateId = roleMappings[role];
    if (mappedTemplateId) {
      const mappedTemplate = templates.find(t => t.id === mappedTemplateId);
      if (mappedTemplate) return mappedTemplate;
    }

    // person.templateId로 직접 매핑된 경우
    if (person.templateId) {
      const personTemplate = templates.find(t => t.id === person.templateId);
      if (personTemplate) return personTemplate;
    }

    return defaultTemplate;
  };

  // 사람별 헤더 색상 가져오기 (기본 템플릿 + 역할별 색상 모드일 때)
  const getHeaderColorForPerson = (person: typeof persons[0] | undefined) => {
    if (!person || !templateColumn) return '#3b82f6';

    const role = person.data[templateColumn];
    if (role && roleColors[role]) {
      return roleColors[role];
    }
    return '#3b82f6'; // 기본 파란색
  };

  // 역할별 색상 모드인지 확인
  const isRoleColorMode = designMode === 'default' && templateMode === 'multi';

  // 비율을 간단한 정수비로 변환하는 함수
  const simplifyRatio = (width: number, height: number): string => {
    // GCD 계산
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

    // 소수점 처리를 위해 100배 후 반올림
    const w = Math.round(width * 100);
    const h = Math.round(height * 100);
    const divisor = gcd(w, h);

    let ratioW = w / divisor;
    let ratioH = h / divisor;

    // 비율이 너무 크면 간단한 소수로 표시
    if (ratioW > 20 || ratioH > 20) {
      const ratio = width / height;
      // 일반적인 비율 근사값 찾기
      const commonRatios = [
        { w: 1, h: 1, r: 1 },
        { w: 4, h: 3, r: 4/3 },
        { w: 3, h: 4, r: 3/4 },
        { w: 16, h: 9, r: 16/9 },
        { w: 9, h: 16, r: 9/16 },
        { w: 3, h: 2, r: 3/2 },
        { w: 2, h: 3, r: 2/3 },
        { w: 5, h: 4, r: 5/4 },
        { w: 4, h: 5, r: 4/5 },
        { w: 2, h: 1, r: 2 },
        { w: 1, h: 2, r: 0.5 },
      ];

      // 가장 가까운 일반 비율 찾기
      let closest = commonRatios[0];
      let minDiff = Math.abs(ratio - closest.r);
      for (const cr of commonRatios) {
        const diff = Math.abs(ratio - cr.r);
        if (diff < minDiff) {
          minDiff = diff;
          closest = cr;
        }
      }

      // 근사값이 5% 이내면 사용
      if (minDiff / ratio < 0.05) {
        return `${closest.w}:${closest.h}`;
      }

      // 그렇지 않으면 소수점 비율 표시
      return `${ratio.toFixed(2)}:1`;
    }

    return `${ratioW}:${ratioH}`;
  };

  const layoutInfo = useMemo(() => {
    const paper = PAPER_SIZES[exportConfig.paperSize];
    const margin = exportConfig.margin;
    const availableWidth = paper.width - margin * 2;
    const availableHeight = paper.height - margin * 2;

    // 명찰 종횡비
    const templateAspect = defaultTemplate ? defaultTemplate.width / defaultTemplate.height : 4 / 3;

    let cols: number;
    let rows: number;
    let cellWidth: number;
    let cellHeight: number;
    let nametagWidth: number;
    let nametagHeight: number;
    let actualGap: number;

    if (exportConfig.sizeMode === 'fixed') {
      // 고정 크기 모드: 고정 크기로 몇 개 들어가는지 계산
      nametagWidth = exportConfig.fixedWidth;
      nametagHeight = exportConfig.fixedHeight;

      // 간격 (명찰 사이 최소 여백)
      const gap = 2; // mm
      actualGap = gap;

      cols = Math.floor((availableWidth + gap) / (nametagWidth + gap));
      rows = Math.floor((availableHeight + gap) / (nametagHeight + gap));

      // 최소 1개는 보장
      cols = Math.max(1, cols);
      rows = Math.max(1, rows);

      // 셀 크기 = 명찰 크기 + 간격
      cellWidth = availableWidth / cols;
      cellHeight = availableHeight / rows;
    } else {
      // 그리드 모드: 레이아웃 기반 + 명찰 간격
      [cols, rows] = exportConfig.layout.split('x').map(Number);
      const gridGap = exportConfig.gridGap || 0;
      actualGap = gridGap;

      // 전체 간격을 제외한 사용 가능 영역
      const totalHorizontalGaps = gridGap * (cols - 1);
      const totalVerticalGaps = gridGap * (rows - 1);
      const contentWidth = availableWidth - totalHorizontalGaps;
      const contentHeight = availableHeight - totalVerticalGaps;

      // 각 셀 크기 (간격 제외)
      cellWidth = contentWidth / cols;
      cellHeight = contentHeight / rows;

      // 셀에 맞게 명찰 크기 계산 (fit contain, 비율 유지)
      nametagWidth = cellWidth;
      nametagHeight = cellWidth / templateAspect;

      if (nametagHeight > cellHeight) {
        nametagHeight = cellHeight;
        nametagWidth = cellHeight * templateAspect;
      }
    }

    // 여유 공간 계산
    const horizontalGap = cellWidth - nametagWidth;
    const verticalGap = cellHeight - nametagHeight;

    const perPage = cols * rows;
    const dataPages = Math.ceil(persons.length / perPage) || 1;
    const blankPages = exportConfig.blankPages || 0;

    return {
      paper,
      margin,
      cols,
      rows,
      cellWidth,
      cellHeight,
      nametagWidth,
      nametagHeight,
      horizontalGap,
      verticalGap,
      templateAspect,
      perPage,
      dataPages,
      blankPages,
      totalPages: dataPages + blankPages,
      isFixed: exportConfig.sizeMode === 'fixed',
      isGrid: exportConfig.sizeMode === 'grid',
      gridGap: actualGap,
    };
  }, [defaultTemplate, exportConfig, persons.length]);

  // 미리보기 스케일 (화면에 맞게)
  const previewScale = 0.8;
  const previewWidth = layoutInfo.paper.width * previewScale;
  const previewHeight = layoutInfo.paper.height * previewScale;

  return (
    <div className="space-y-4">
      {/* 명찰 크기 정보 (핵심) */}
      <div className={`rounded-lg p-3 border ${layoutInfo.isFixed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${layoutInfo.isFixed ? 'text-green-600' : 'text-blue-600'}`}>
            {layoutInfo.isFixed ? '고정 크기' : '그리드 레이아웃'}
          </span>
          <div className="text-right">
            <span className={`text-lg font-bold ${layoutInfo.isFixed ? 'text-green-700' : 'text-blue-700'}`}>
              {layoutInfo.nametagWidth.toFixed(1)} × {layoutInfo.nametagHeight.toFixed(1)} mm
            </span>
            <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${layoutInfo.isFixed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {simplifyRatio(layoutInfo.nametagWidth, layoutInfo.nametagHeight)}
            </span>
          </div>
        </div>
        <div className={`text-[10px] ${layoutInfo.isFixed ? 'text-green-600' : 'text-blue-500'}`}>
          {layoutInfo.isFixed ? (
            <span>자동 배열: {layoutInfo.cols}×{layoutInfo.rows} ({layoutInfo.perPage}장/페이지)</span>
          ) : (
            <span>{layoutInfo.cols}×{layoutInfo.rows} ({layoutInfo.perPage}장/페이지) | 간격: {layoutInfo.gridGap}mm</span>
          )}
        </div>
      </div>

      {/* 레이아웃 정보 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded p-2">
          <span className="text-slate-400">총 페이지</span>
          <p className="font-bold">
            {layoutInfo.totalPages}페이지
            {layoutInfo.blankPages > 0 && (
              <span className="text-slate-400 font-normal text-[10px] ml-1">
                (빈 {layoutInfo.blankPages})
              </span>
            )}
          </p>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <span className="text-slate-400">총 명찰</span>
          <p className="font-bold">{persons.length}장</p>
        </div>
      </div>

      {/* 미리보기 */}
      <div className="flex justify-center">
        <div
          className="bg-white border-2 border-slate-200 shadow-lg relative"
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
          }}
        >
          {/* 여백 표시 */}
          <div
            className="absolute border border-dashed border-slate-300"
            style={{
              left: `${layoutInfo.margin * previewScale}px`,
              top: `${layoutInfo.margin * previewScale}px`,
              right: `${layoutInfo.margin * previewScale}px`,
              bottom: `${layoutInfo.margin * previewScale}px`,
            }}
          />

          {/* 그리드 셀 */}
          {Array.from({ length: layoutInfo.rows }).map((_, row) =>
            Array.from({ length: layoutInfo.cols }).map((_, col) => {
              const personIndex = row * layoutInfo.cols + col;
              const person = persons[personIndex];
              // 각 사람의 역할에 맞는 템플릿 가져오기
              const personTemplate = getTemplateForPerson(person);

              // 셀 위치 계산 (그리드 모드에서는 간격 반영)
              const cellLeft = layoutInfo.isGrid
                ? layoutInfo.margin + col * (layoutInfo.cellWidth + layoutInfo.gridGap)
                : layoutInfo.margin + col * layoutInfo.cellWidth;
              const cellTop = layoutInfo.isGrid
                ? layoutInfo.margin + row * (layoutInfo.cellHeight + layoutInfo.gridGap)
                : layoutInfo.margin + row * layoutInfo.cellHeight;

              return (
                <div
                  key={`${row}-${col}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${cellLeft * previewScale}px`,
                    top: `${cellTop * previewScale}px`,
                    width: `${layoutInfo.cellWidth * previewScale}px`,
                    height: `${layoutInfo.cellHeight * previewScale}px`,
                  }}
                >
                  {/* 명찰 */}
                  <div
                    className="bg-slate-100 border border-slate-300 rounded overflow-hidden flex items-center justify-center"
                    style={{
                      width: `${layoutInfo.nametagWidth * previewScale}px`,
                      height: `${layoutInfo.nametagHeight * previewScale}px`,
                    }}
                  >
                    {personTemplate?.id === 'default-template' ? (
                      // 기본 템플릿: HTML 기반 렌더링 (center-panel과 동일한 구조)
                      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
                        <div className="absolute inset-[3%] border border-slate-200 rounded bg-white flex flex-col overflow-hidden">
                          {/* 헤더 - 역할별 색상 적용 */}
                          <div
                            className="py-[8%] flex items-center justify-center"
                            style={{ backgroundColor: isRoleColorMode ? getHeaderColorForPerson(person) : '#3b82f6' }}
                          >
                            <span className="text-white font-bold text-[4px]">NAME TAG</span>
                          </div>
                          {/* 텍스트 필드 영역 */}
                          <div className="flex-1 relative">
                            {person && textFields.map((field) => {
                              // 폰트 크기 비례 계산 (기준: 400px 캔버스)
                              const previewNametagWidth = layoutInfo.nametagWidth * previewScale;
                              const scaledFontSize = Math.max(3, field.style.fontSize * (previewNametagWidth / RENDER_WIDTH));
                              return (
                                <div
                                  key={field.id}
                                  className="absolute text-center"
                                  style={{
                                    left: `${field.position.x}%`,
                                    top: `${field.position.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: `${scaledFontSize}px`,
                                    fontWeight: field.style.fontWeight,
                                    fontFamily: field.style.fontFamily,
                                    color: field.style.color,
                                    width: '90%',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {person.data[field.column] || ''}
                                </div>
                              );
                            })}
                          </div>
                          {/* 하단 */}
                          <div className="flex flex-col items-center justify-center pb-[6%]">
                            <div className="w-[80%] border-t border-slate-200 mb-[4%]" />
                            <span className="text-slate-400 text-[3px]">Company</span>
                          </div>
                        </div>
                      </div>
                    ) : personTemplate ? (
                      // 커스텀 템플릿 또는 기본 템플릿(색상 모드 아닐 때): 이미지 배경
                      <div
                        className="w-full h-full bg-center bg-no-repeat relative"
                        style={{
                          backgroundImage: `url(${personTemplate.dataUrl || personTemplate.thumbnailUrl || personTemplate.imageUrl})`,
                          backgroundSize: 'contain',
                        }}
                      >
                        {/* 모든 텍스트 필드 렌더링 */}
                        {person && textFields.map((field) => {
                          // 폰트 크기 비례 계산 (기준: 400px 캔버스)
                          const previewNametagWidth = layoutInfo.nametagWidth * previewScale;
                          const scaledFontSize = Math.max(3, field.style.fontSize * (previewNametagWidth / RENDER_WIDTH));
                          return (
                            <div
                              key={field.id}
                              className="absolute text-center"
                              style={{
                                left: `${field.position.x}%`,
                                top: `${field.position.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${scaledFontSize}px`,
                                fontWeight: field.style.fontWeight,
                                fontFamily: field.style.fontFamily,
                                color: field.style.color,
                                width: '90%',
                                lineHeight: 1.2,
                              }}
                            >
                              {person.data[field.column] || ''}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[8px] text-slate-400">
                        {personIndex + 1}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 안내 메시지 */}
      {layoutInfo.horizontalGap > 5 || layoutInfo.verticalGap > 5 ? (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-700">
          <p className="font-medium">셀과 명찰 비율 차이로 여백 발생</p>
          <p className="text-amber-600 mt-0.5">
            가로 여백: {layoutInfo.horizontalGap.toFixed(1)}mm, 세로 여백: {layoutInfo.verticalGap.toFixed(1)}mm
          </p>
        </div>
      ) : (
        <p className="text-xs text-green-600 text-center bg-green-50 border border-green-200 rounded p-2">
          레이아웃이 명찰에 잘 맞습니다.
        </p>
      )}
    </div>
  );
}
