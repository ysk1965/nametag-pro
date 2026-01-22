'use client';

import { useState } from 'react';
import { X, FileDown, Link2, Link2Off, FileText, Minus, Plus, Settings2, Grid3X3, Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { LayoutPreview } from './layout-preview';
import Image from 'next/image';

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
  const t = useTranslations('editor.exportSettings');
  const { exportConfig, setExportConfig, persons, templates, designMode } = useEditorStore();
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [showBlankPagesModal, setShowBlankPagesModal] = useState(false);

  if (!isOpen) return null;

  // 커스텀 템플릿만 필터링 (default-template 제외)
  const customTemplates = templates.filter(t => t.id !== 'default-template');
  const hasMultipleTemplates = customTemplates.length > 1;

  // 템플릿별 총 빈 페이지 수 계산 (현재 존재하는 템플릿만)
  const getTotalBlankPages = () => {
    if (hasMultipleTemplates) {
      const blankPages = exportConfig.blankPagesPerTemplate || {};
      // 현재 존재하는 템플릿의 빈 페이지만 합산
      return customTemplates.reduce((sum, template) => {
        return sum + (blankPages[template.id] || 0);
      }, 0);
    }
    return exportConfig.blankPages || 0;
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
    ...(originalSize ? [{ w: originalSize.w, h: originalSize.h, label: t('original') }] : []),
    { w: 90, h: 55, label: t('businessCard') },
    { w: 86, h: 54, label: t('card') },
    { w: 100, h: 70, label: t('large') },
    { w: 75, h: 50, label: t('small') },
  ];

  // 레이아웃 옵션
  const layoutOptions = [
    { value: '2x2' as const, label: '2×2', desc: t('perPage', { count: 4 }) },
    { value: '3x3' as const, label: '3×3', desc: t('perPage', { count: 9 }) },
    { value: '2x4' as const, label: '2×4', desc: t('perPage', { count: 8 }) },
    { value: '2x3' as const, label: '2×3', desc: t('perPage', { count: 6 }) },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-slate-800">{t('title')}</h3>
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
                  {t('paperSize')}
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

              {/* 크기 모드 탭 */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  {t('arrangementMode')}
                </label>
                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setExportConfig({ sizeMode: 'grid' })}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      exportConfig.sizeMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Grid3X3 size={14} />
                    {t('grid')}
                  </button>
                  <button
                    onClick={() => setExportConfig({ sizeMode: 'fixed' })}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      exportConfig.sizeMode === 'fixed'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Ruler size={14} />
                    {t('fixedSize')}
                  </button>
                </div>
              </div>

              {/* 그리드 모드 설정 */}
              {exportConfig.sizeMode === 'grid' && (
                <>
                  {/* 레이아웃 선택 */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 block">
                      {t('layout')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {layoutOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setExportConfig({ layout: option.value })}
                          className={`py-2.5 px-2 rounded-lg border text-center transition-colors ${
                            exportConfig.layout === option.value
                              ? 'bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-sm">{option.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 여백 설정 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-2 block">
                        {t('pageMargin', { value: exportConfig.margin })}
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
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-2 block">
                        {t('nametagGap', { value: exportConfig.gridGap })}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={exportConfig.gridGap}
                        onChange={(e) => setExportConfig({ gridGap: parseInt(e.target.value) })}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 고정 크기 모드 설정 */}
              {exportConfig.sizeMode === 'fixed' && (
                <>
                  {/* 명찰 크기 */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 block">
                      {t('nametagSize')}
                    </label>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      {/* 프리셋 버튼 */}
                      <div className="flex gap-1.5 flex-wrap">
                        {presets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              setExportConfig({ fixedWidth: preset.w, fixedHeight: preset.h });
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
                            {t('width')}
                          </label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={exportConfig.fixedWidth}
                            onChange={(e) => {
                              const newWidth = parseInt(e.target.value) || 20;
                              if (lockAspectRatio && exportConfig.fixedWidth > 0) {
                                const currentRatio = exportConfig.fixedWidth / exportConfig.fixedHeight;
                                const newHeight = Math.round(newWidth / currentRatio);
                                setExportConfig({ fixedWidth: newWidth, fixedHeight: Math.max(20, Math.min(200, newHeight)) });
                              } else {
                                setExportConfig({ fixedWidth: newWidth });
                              }
                            }}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                          />
                        </div>

                        {/* 비율 고정 토글 */}
                        <button
                          onClick={() => setLockAspectRatio(!lockAspectRatio)}
                          className={`p-2 rounded-lg border transition-colors mb-0.5 ${
                            lockAspectRatio
                              ? 'bg-blue-50 border-blue-300 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                          title={lockAspectRatio ? t('unlockRatio') : t('lockRatio')}
                        >
                          {lockAspectRatio ? <Link2 size={16} /> : <Link2Off size={16} />}
                        </button>

                        <div className="flex-1">
                          <label className="text-[10px] font-medium text-slate-500 mb-1 block">
                            {t('height')}
                          </label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={exportConfig.fixedHeight}
                            onChange={(e) => {
                              const newHeight = parseInt(e.target.value) || 20;
                              if (lockAspectRatio && exportConfig.fixedHeight > 0) {
                                const currentRatio = exportConfig.fixedWidth / exportConfig.fixedHeight;
                                const newWidth = Math.round(newHeight * currentRatio);
                                setExportConfig({ fixedWidth: Math.max(20, Math.min(200, newWidth)), fixedHeight: newHeight });
                              } else {
                                setExportConfig({ fixedHeight: newHeight });
                              }
                            }}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 여백 */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-2 block">
                      {t('pageMargin', { value: exportConfig.margin })}
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
                </>
              )}

              {/* Blank Nametags */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                  {t('blankNametags')}
                </label>
                <div className="bg-slate-50 rounded-lg p-3">
                  {hasMultipleTemplates ? (
                    // 템플릿 2개 이상: 템플릿별 설정 버튼
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {t('totalCount', { count: getTotalBlankPages() })}
                          </span>
                        </div>
                        <button
                          onClick={() => setShowBlankPagesModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Settings2 size={14} />
                          {t('perTemplateSettings')}
                        </button>
                      </div>
                      {getTotalBlankPages() > 0 && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          {t('blankPagesPerTemplateDesc')}
                        </p>
                      )}
                    </>
                  ) : (
                    // 템플릿 1개: 기존 UI
                    <>
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-slate-400" />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExportConfig({ blankPages: Math.max(0, (exportConfig.blankPages || 0) - 1) })}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                            disabled={(exportConfig.blankPages || 0) === 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-bold text-slate-700">
                            {exportConfig.blankPages || 0}
                          </span>
                          <button
                            onClick={() => setExportConfig({ blankPages: Math.min(50, (exportConfig.blankPages || 0) + 1) })}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-xs text-slate-500">{t('unit')}</span>
                      </div>
                      {(exportConfig.blankPages || 0) > 0 && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          {t('blankPagesAddedDesc')}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 미리보기 */}
            <div className="w-64 shrink-0">
              <label className="text-xs font-medium text-slate-600 mb-2 block">
                {t('preview')}
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
            {t('generateNametags', { count: persons.length })}
            {getTotalBlankPages() > 0 && (
              <span className="text-blue-200 text-xs">
                {t('plusBlank', { count: getTotalBlankPages() })}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 템플릿별 빈 명찰 설정 모달 */}
      {showBlankPagesModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBlankPagesModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base text-slate-800">{t('blankPagesPerTemplateTitle')}</h3>
              <button onClick={() => setShowBlankPagesModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={18} />
              </button>
            </div>

            {/* 템플릿 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {customTemplates.map((template) => {
                const currentCount = exportConfig.blankPagesPerTemplate?.[template.id] || 0;
                return (
                  <div
                    key={template.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    {/* 템플릿 썸네일 */}
                    <div className="w-16 h-12 relative bg-white rounded border border-slate-200 overflow-hidden shrink-0">
                      <Image
                        src={template.thumbnailUrl || template.dataUrl || template.imageUrl}
                        alt={template.fileName}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* 템플릿 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {template.role || template.fileName}
                      </p>
                      {template.role && (
                        <p className="text-[10px] text-slate-400 truncate">{template.fileName}</p>
                      )}
                    </div>

                    {/* 페이지 수 조절 */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const newBlankPages = { ...exportConfig.blankPagesPerTemplate };
                          newBlankPages[template.id] = Math.max(0, currentCount - 1);
                          setExportConfig({ blankPagesPerTemplate: newBlankPages });
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                        disabled={currentCount === 0}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700 text-sm">
                        {currentCount}
                      </span>
                      <button
                        onClick={() => {
                          const newBlankPages = { ...exportConfig.blankPagesPerTemplate };
                          newBlankPages[template.id] = Math.min(50, currentCount + 1);
                          setExportConfig({ blankPagesPerTemplate: newBlankPages });
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 푸터 */}
            <div className="px-4 py-3 border-t bg-slate-50 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {t('totalBlankNametags', { count: getTotalBlankPages() })}
                </span>
                <button
                  onClick={() => setShowBlankPagesModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  {t('done')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
