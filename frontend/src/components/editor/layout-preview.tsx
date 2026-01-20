'use client';

import { useMemo } from 'react';
import { useEditorStore } from '@/stores/editor-store';

const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

export function LayoutPreview() {
  const { templates, persons, exportConfig, textFields } = useEditorStore();

  const template = templates[0];
  const isDefaultTemplate = template?.id === 'default-template';

  const layoutInfo = useMemo(() => {
    const paper = PAPER_SIZES[exportConfig.paperSize];
    const margin = exportConfig.margin;
    const availableWidth = paper.width - margin * 2;
    const availableHeight = paper.height - margin * 2;

    // 명찰 종횡비
    const templateAspect = template ? template.width / template.height : 4 / 3;

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
  }, [template, exportConfig, persons.length]);

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
              {template && (
                <span className="ml-2">
                  | 원본 비율: {template.width}:{template.height}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* 레이아웃 정보 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded p-2">
          <span className="text-slate-400">용지</span>
          <p className="font-bold">{exportConfig.paperSize}</p>
        </div>
        <div className="bg-slate-50 rounded p-2">
          <span className="text-slate-400">배열</span>
          <p className="font-bold">{layoutInfo.cols}×{layoutInfo.rows} ({layoutInfo.perPage}장/페이지)</p>
        </div>
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
                    {template && isDefaultTemplate ? (
                      // 기본 템플릿: HTML 기반 렌더링
                      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
                        <div className="absolute inset-[3%] border border-slate-200 rounded bg-white flex flex-col overflow-hidden">
                          {/* 헤더 */}
                          <div className="bg-blue-500 h-[22%] flex items-center justify-center">
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
                          <div className="h-[18%] flex flex-col items-center justify-center">
                            <div className="w-[80%] border-t border-slate-200 mb-[2px]" />
                            <span className="text-slate-400 text-[3px]">Company</span>
                          </div>
                        </div>
                      </div>
                    ) : template ? (
                      // 업로드 템플릿: 이미지 기반
                      <div
                        className="w-full h-full bg-center relative"
                        style={{
                          backgroundImage: `url(${template.dataUrl || template.thumbnailUrl || template.imageUrl})`,
                          backgroundSize: exportConfig.sizeMode === 'fixed' ? '100% 100%' : 'cover',
                        }}
                      >
                        {person && previewColumn && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="text-[6px] font-bold text-center px-1 bg-white/80 rounded"
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
