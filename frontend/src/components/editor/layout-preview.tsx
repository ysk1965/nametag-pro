'use client';

import { useMemo } from 'react';
import { useEditorStore } from '@/stores/editor-store';

const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

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

    if (exportConfig.sizeMode === 'fixed') {
      // 고정 크기 모드: 고정 크기로 몇 개 들어가는지 계산
      nametagWidth = exportConfig.fixedWidth;
      nametagHeight = exportConfig.fixedHeight;

      // 간격 (명찰 사이 최소 여백)
      const gap = 2; // mm

      cols = Math.floor((availableWidth + gap) / (nametagWidth + gap));
      rows = Math.floor((availableHeight + gap) / (nametagHeight + gap));

      // 최소 1개는 보장
      cols = Math.max(1, cols);
      rows = Math.max(1, rows);

      // 셀 크기 = 명찰 크기 + 간격
      cellWidth = (availableWidth) / cols;
      cellHeight = (availableHeight) / rows;
    } else {
      // 자동 모드: 레이아웃 기반
      [cols, rows] = exportConfig.layout.split('x').map(Number);
      cellWidth = availableWidth / cols;
      cellHeight = availableHeight / rows;

      // 셀에 맞게 명찰 크기 계산 (fit contain)
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
      perPage: cols * rows,
      totalPages: Math.ceil(persons.length / (cols * rows)) || 1,
      isFixed: exportConfig.sizeMode === 'fixed',
    };
  }, [defaultTemplate, exportConfig, persons.length]);

  // 미리보기 스케일 (화면에 맞게)
  const previewScale = 0.8;
  const previewWidth = layoutInfo.paper.width * previewScale;
  const previewHeight = layoutInfo.paper.height * previewScale;

  // 첫 번째 텍스트 필드의 컬럼명 가져오기 (미리보기용)
  const previewColumn = textFields[0]?.column;

  return (
    <div className="space-y-4">
      {/* 명찰 크기 정보 (핵심) */}
      <div className={`rounded-lg p-3 border ${layoutInfo.isFixed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${layoutInfo.isFixed ? 'text-green-600' : 'text-blue-600'}`}>
            {layoutInfo.isFixed ? '고정 명찰 크기' : '출력 명찰 크기'}
          </span>
          <span className={`text-lg font-bold ${layoutInfo.isFixed ? 'text-green-700' : 'text-blue-700'}`}>
            {layoutInfo.nametagWidth.toFixed(1)} × {layoutInfo.nametagHeight.toFixed(1)} mm
          </span>
        </div>
        <div className={`text-[10px] ${layoutInfo.isFixed ? 'text-green-600' : 'text-blue-500'}`}>
          {layoutInfo.isFixed ? (
            <span>자동 배열: {layoutInfo.cols}×{layoutInfo.rows} ({layoutInfo.perPage}장/페이지)</span>
          ) : (
            <>
              셀 크기: {layoutInfo.cellWidth.toFixed(1)} × {layoutInfo.cellHeight.toFixed(1)} mm
              {defaultTemplate && (
                <span className="ml-2">
                  | 원본 비율: {defaultTemplate.width}:{defaultTemplate.height}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* 레이아웃 정보 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded p-2">
          <span className="text-slate-400">총 페이지</span>
          <p className="font-bold">{layoutInfo.totalPages}페이지</p>
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

              return (
                <div
                  key={`${row}-${col}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${(layoutInfo.margin + col * layoutInfo.cellWidth) * previewScale}px`,
                    top: `${(layoutInfo.margin + row * layoutInfo.cellHeight) * previewScale}px`,
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
                          {/* 이름 영역 */}
                          <div className="flex-1 flex items-center justify-center">
                            {person && previewColumn && (
                              <span className="text-[5px] font-bold text-center">
                                {person.data[previewColumn]?.substring(0, 6) || ''}
                              </span>
                            )}
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
                          backgroundSize: '100% 100%',
                        }}
                      >
                        {person && previewColumn && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="text-[5px] font-bold text-center"
                              style={{ maxWidth: '90%' }}
                            >
                              {person.data[previewColumn]?.substring(0, 6) || ''}
                            </span>
                          </div>
                        )}
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
