'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Plus, Minus, ArrowRight, X, FileText, ChevronDown, ChevronUp, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { useAuthStore } from '@/stores/auth-store';

interface BlankPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (blankPagesData: { blankPages?: number; blankPagesPerTemplate?: Record<string, number> }, watermarkOptions?: { watermarkEnabled?: boolean; watermarkText?: string }) => void;
}

export function BlankPagesModal({ isOpen, onClose, onConfirm }: BlankPagesModalProps) {
  const t = useTranslations('editor.blankPages');
  const { exportConfig, setExportConfig, persons, templates } = useEditorStore();
  const { isAuthenticated } = useAuthStore();

  // 커스텀 템플릿만 필터링
  const customTemplates = templates.filter(t => t.id !== 'default-template');
  const hasMultipleTemplates = customTemplates.length > 1;

  // 빈 페이지 섹션 열림 상태
  const [isBlankSectionOpen, setIsBlankSectionOpen] = useState(false);

  // 워터마크 섹션 열림 상태 (로그인 유저만)
  const [isWatermarkSectionOpen, setIsWatermarkSectionOpen] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');

  // 템플릿별 빈 페이지 수 (multi mode일 때)
  const [templateBlankPages, setTemplateBlankPages] = useState<Record<string, number>>({});
  // 단일 빈 페이지 수 (single mode 또는 기본 명찰)
  const [singleBlankPages, setSingleBlankPages] = useState(exportConfig.blankPages || 0);

  // 모달 열릴 때 초기화 (기존 값 유지)
  useEffect(() => {
    if (isOpen) {
      setSingleBlankPages(exportConfig.blankPages || 0);
      // 빈 페이지가 설정되어 있으면 섹션 열기
      const hasExistingBlankPages =
        (exportConfig.blankPages || 0) > 0 ||
        Object.values(exportConfig.blankPagesPerTemplate || {}).some(v => v > 0);
      setIsBlankSectionOpen(hasExistingBlankPages);
      // 템플릿별 초기화 (기존 값 유지)
      const initial: Record<string, number> = {};
      const existingBlankPages = exportConfig.blankPagesPerTemplate || {};
      customTemplates.forEach(t => {
        initial[t.id] = existingBlankPages[t.id] || 0;
      });
      setTemplateBlankPages(initial);
      // 워터마크 초기화
      setWatermarkEnabled(false);
      setWatermarkText('');
    }
  }, [isOpen]);

  const handleIncrement = (templateId?: string) => {
    if (templateId) {
      setTemplateBlankPages(prev => ({
        ...prev,
        [templateId]: Math.min((prev[templateId] || 0) + 1, 100)
      }));
    } else {
      setSingleBlankPages(prev => Math.min(prev + 1, 100));
    }
  };

  const handleDecrement = (templateId?: string) => {
    if (templateId) {
      setTemplateBlankPages(prev => ({
        ...prev,
        [templateId]: Math.max((prev[templateId] || 0) - 1, 0)
      }));
    } else {
      setSingleBlankPages(prev => Math.max(prev - 1, 0));
    }
  };

  // 총 빈 페이지 수 계산
  const totalBlankPages = hasMultipleTemplates
    ? Object.values(templateBlankPages).reduce((sum, count) => sum + count, 0)
    : singleBlankPages;

  const handleGenerate = () => {
    // 빈 명찰 데이터 생성
    const blankPagesData = hasMultipleTemplates
      ? { blankPagesPerTemplate: templateBlankPages }
      : { blankPages: singleBlankPages };

    // 스토어에도 저장 (다음 사용을 위해)
    setExportConfig(blankPagesData);

    // 워터마크 옵션 (로그인 유저만)
    const watermarkOptions = isAuthenticated && watermarkEnabled
      ? { watermarkEnabled: true, watermarkText: watermarkText || 'NametagPro' }
      : undefined;

    // onConfirm에 데이터 직접 전달 (상태 업데이트 비동기 이슈 해결)
    onConfirm(blankPagesData, watermarkOptions);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative bg-white rounded-2xl shadow-2xl w-full m-4 overflow-hidden max-h-[85vh] flex flex-col ${
              hasMultipleTemplates ? 'max-w-lg' : 'max-w-md'
            }`}
          >
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4 text-center bg-gradient-to-b from-blue-50 to-white shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center"
              >
                <Sparkles size={32} className="text-blue-600" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-slate-800 mb-2"
              >
                {t('title')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-slate-500"
              >
                {t('subtitle', { count: persons.length })}
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* 빈 페이지 추가 섹션 (접힘 가능) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* 토글 헤더 */}
                <button
                  onClick={() => setIsBlankSectionOpen(!isBlankSectionOpen)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText size={16} className="text-slate-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700">{t('addBlankNametags')}</p>
                      <p className="text-xs text-slate-400">{t('forManualWork')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalBlankPages > 0 && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {t('plusCount', { count: totalBlankPages })}
                      </span>
                    )}
                    {isBlankSectionOpen ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {/* 접힘 내용 */}
                <AnimatePresence>
                  {isBlankSectionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-slate-100">
                        {hasMultipleTemplates ? (
                          /* 템플릿별 빈 페이지 설정 */
                          <div className="space-y-2 mt-3">
                            {customTemplates.map((template) => (
                              <div
                                key={template.id}
                                className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                              >
                                {/* 템플릿 미리보기 */}
                                <div
                                  className="w-12 h-8 rounded border border-slate-200 bg-white overflow-hidden shrink-0"
                                  style={{
                                    backgroundImage: `url(${template.dataUrl || template.imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                />

                                {/* 템플릿 이름 */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-600 truncate">
                                    {template.fileName}
                                  </p>
                                </div>

                                {/* 페이지 수 조절 */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleDecrement(template.id)}
                                    disabled={(templateBlankPages[template.id] || 0) === 0}
                                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                      (templateBlankPages[template.id] || 0) === 0
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-slate-700">
                                    {templateBlankPages[template.id] || 0}
                                  </span>
                                  <button
                                    onClick={() => handleIncrement(template.id)}
                                    className="w-7 h-7 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-all"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* 단일 빈 페이지 설정 */
                          <div className="flex items-center justify-center gap-4 mt-3 py-2">
                            <button
                              onClick={() => handleDecrement()}
                              disabled={singleBlankPages === 0}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                singleBlankPages === 0
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              <Minus size={18} />
                            </button>
                            <div className="w-16 text-center">
                              <span className="text-2xl font-bold text-slate-700">{singleBlankPages}</span>
                              <span className="text-xs text-slate-400 block">{t('unit')}</span>
                            </div>
                            <button
                              onClick={() => handleIncrement()}
                              className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-all"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 워터마크 섹션 (로그인 유저만 표시) */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="border border-slate-200 rounded-xl overflow-hidden mt-4"
                >
                  {/* 토글 헤더 */}
                  <button
                    onClick={() => setIsWatermarkSectionOpen(!isWatermarkSectionOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Droplets size={16} className="text-purple-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-700">{t('watermark.title') || '워터마크'}</p>
                        <p className="text-xs text-slate-400">{t('watermark.subtitle') || 'PDF에 워터마크 추가'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {watermarkEnabled && (
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          ON
                        </span>
                      )}
                      {isWatermarkSectionOpen ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* 접힘 내용 */}
                  <AnimatePresence>
                    {isWatermarkSectionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-slate-100 space-y-3">
                          {/* 활성화 토글 */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-slate-600">{t('watermark.enable') || '워터마크 사용'}</span>
                            <button
                              onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                watermarkEnabled ? 'bg-purple-500' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  watermarkEnabled ? 'translate-x-7' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          {/* 워터마크 텍스트 입력 */}
                          {watermarkEnabled && (
                            <div className="space-y-2">
                              <label className="text-sm text-slate-600">{t('watermark.text') || '워터마크 텍스트'}</label>
                              <input
                                type="text"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder="NametagPro"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 shrink-0">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleGenerate}
                className="w-full py-4 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2 transition-all text-lg"
              >
                {totalBlankPages > 0
                  ? t('generateWithBlank', { count: persons.length, blankCount: totalBlankPages })
                  : t('generate', { count: persons.length })
                }
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
