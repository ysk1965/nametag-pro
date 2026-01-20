'use client';

import { useState, useRef } from 'react';
import { X, FileDown, Link2, Link2Off } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { LayoutPreview } from './layout-preview';

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ExportSettingsModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}: ExportSettingsModalProps) {
  const { exportConfig, setExportConfig, persons, templates, designMode } = useEditorStore();
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const aspectRatioRef = useRef(exportConfig.fixedWidth / exportConfig.fixedHeight);

  if (!isOpen) return null;

  // 비율 업데이트 (프리셋 선택 시)
  const updateAspectRatio = (width: number, height: number) => {
    aspectRatioRef.current = width / height;
  };

  // 원본 템플릿 크기 계산 (첫 번째 커스텀 템플릿 기준)
  const getOriginalSize = () => {
    if (designMode === 'custom') {
      const customTemplate = templates.find(t => t.id !== 'default-template');
      if (customTemplate) {
        // 픽셀을 mm로 변환 (10px = 1mm 기준, 최대 150mm 제한)
        const scale = 0.1;
        const maxDimension = 150;
        let width = Math.round(customTemplate.width * scale);
        let height = Math.round(customTemplate.height * scale);

        // 최대 크기 제한
        if (width > maxDimension || height > maxDimension) {
          const ratio = maxDimension / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // 최소 크기 보장 (20mm)
        if (width < 20) width = 20;
        if (height < 20) height = 20;

        return { w: width, h: height };
      }
    }
    return null;
  };

  const originalSize = getOriginalSize();

  // 프리셋 목록
  const presets = [
    ...(originalSize ? [{ w: originalSize.w, h: originalSize.h, label: '원본' }] : []),
    { w: 90, h: 55, label: '명함' },
    { w: 86, h: 54, label: '카드' },
    { w: 100, h: 70, label: '대형' },
    { w: 75, h: 50, label: '소형' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-slate-800">출력 설정</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* 설정 내용 - 2단 레이아웃 */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex gap-6">
            {/* 왼쪽: 설정 옵션 */}
            <div className="flex-1 space-y-5">
              {/* Paper Size */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  용지 크기
                </label>
                <div className="flex gap-2">
                  {(['A4', 'Letter'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setExportConfig({ paperSize: size })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                        exportConfig.paperSize === size
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 명찰 크기 */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  명찰 크기
                </label>
                <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                  {/* 프리셋 버튼 */}
                  <div className="flex gap-1.5 flex-wrap">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setExportConfig({ fixedWidth: preset.w, fixedHeight: preset.h, sizeMode: 'fixed' });
                          updateAspectRatio(preset.w, preset.h);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          exportConfig.fixedWidth === preset.w && exportConfig.fixedHeight === preset.h
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* 가로/세로 입력 */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-slate-500 mb-1 block">
                        가로 (mm)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        value={exportConfig.fixedWidth}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 20;
                          if (lockAspectRatio) {
                            const newHeight = Math.round(newWidth / aspectRatioRef.current);
                            setExportConfig({ fixedWidth: newWidth, fixedHeight: Math.max(20, Math.min(200, newHeight)), sizeMode: 'fixed' });
                          } else {
                            setExportConfig({ fixedWidth: newWidth, sizeMode: 'fixed' });
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                      />
                    </div>

                    {/* 비율 고정 토글 */}
                    <button
                      onClick={() => {
                        if (!lockAspectRatio) {
                          // 잠금 활성화 시 현재 비율 저장
                          updateAspectRatio(exportConfig.fixedWidth, exportConfig.fixedHeight);
                        }
                        setLockAspectRatio(!lockAspectRatio);
                      }}
                      className={`p-2 rounded-lg border transition-colors mb-0.5 ${
                        lockAspectRatio
                          ? 'bg-blue-50 border-blue-300 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                      title={lockAspectRatio ? '비율 고정 해제' : '비율 고정'}
                    >
                      {lockAspectRatio ? <Link2 size={16} /> : <Link2Off size={16} />}
                    </button>

                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-slate-500 mb-1 block">
                        세로 (mm)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        value={exportConfig.fixedHeight}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 20;
                          if (lockAspectRatio) {
                            const newWidth = Math.round(newHeight * aspectRatioRef.current);
                            setExportConfig({ fixedWidth: Math.max(20, Math.min(200, newWidth)), fixedHeight: newHeight, sizeMode: 'fixed' });
                          } else {
                            setExportConfig({ fixedHeight: newHeight, sizeMode: 'fixed' });
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  여백 ({exportConfig.margin}mm)
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={exportConfig.margin}
                  onChange={(e) => setExportConfig({ margin: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            {/* 오른쪽: 미리보기 */}
            <div className="w-64 shrink-0">
              <label className="text-xs font-medium text-slate-600 mb-2 block">
                미리보기
              </label>
              <LayoutPreview />
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 border-t bg-slate-50 shrink-0">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileDown size={18} />
            {persons.length}명 명찰 생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
