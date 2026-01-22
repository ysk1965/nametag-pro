'use client';

import { useState } from 'react';
import { Settings2, FileImage, Sparkles, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TemplateUpload } from './template-upload';
import { TemplateList } from './template-list';
import { DataUpload } from './data-upload';
import { DataPreview } from './data-preview';
import { MultiTemplateModal } from './multi-template-modal';
import { useEditorStore } from '@/stores/editor-store';

// 템플릿 정보 모달 컴포넌트
function TemplateInfoModal({
  isOpen,
  onClose,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: 'default' | 'custom';
}) {
  const t = useTranslations('editor.templateInfo');

  const content = type === 'default' ? {
    title: t('default.title'),
    icon: <Sparkles size={24} className="text-blue-600" />,
    description: t('default.description'),
    features: [
      t('default.features.noUpload'),
      t('default.features.header'),
      t('default.features.roleColor'),
      t('default.features.textFree'),
    ],
    tip: t('default.tip'),
  } : {
    title: t('custom.title'),
    icon: <FileImage size={24} className="text-blue-600" />,
    description: t('custom.description'),
    features: [
      t('custom.features.formats'),
      t('custom.features.multiDesign'),
      t('custom.features.ratio'),
      t('custom.features.textFree'),
    ],
    tip: t('custom.tip'),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm m-4 overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-blue-50 to-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                {content.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{content.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{content.description}</p>
            </div>

            {/* Features */}
            <div className="px-6 py-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('mainFeatures')}</h4>
              <ul className="space-y-2">
                {content.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tip */}
            <div className="px-6 pb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <span className="font-bold">TIP:</span> {content.tip}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function LeftPanel() {
  const t = useTranslations('editor.leftPanel');
  const {
    templates,
    persons,
    templateMode,
    templateColumn,
    roleCounts,
    roleMappings,
    roleColors,
    designMode,
    setTemplateMode,
    setDesignMode,
  } = useEditorStore();

  // 멀티 템플릿 모달 상태
  const [isMultiTemplateModalOpen, setIsMultiTemplateModalOpen] = useState(false);
  // 템플릿 정보 모달 상태
  const [infoModalType, setInfoModalType] = useState<'default' | 'custom' | null>(null);

  // 멀티 템플릿 설정 완료 여부 (기본 명찰은 색상, 커스텀은 템플릿 매핑)
  const isMultiTemplateConfigured = templateMode === 'multi' && templateColumn &&
    roleCounts.length > 0 && (
      designMode === 'default'
        ? roleCounts.every((r) => roleColors[r.role])
        : roleCounts.every((r) => roleMappings[r.role])
    );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8">
      {/* Guest List Section - 먼저 명단 업로드 */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          {t('guestList')}
        </label>
        {persons.length > 0 ? <DataPreview /> : <DataUpload />}
      </section>

      {/* Templates Section */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          {t('templates')}
        </label>

        {/* 기본 명찰 vs 내 디자인 선택 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div
            onClick={() => {
              setDesignMode('default');
              setTemplateMode('single');
            }}
            className={`relative p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
              designMode === 'default'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInfoModalType('default');
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/50 transition-colors"
            >
              <Info size={14} className="text-slate-400" />
            </button>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              designMode === 'default' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <Sparkles size={18} className={designMode === 'default' ? 'text-blue-600' : 'text-slate-400'} />
            </div>
            <span className={`text-sm font-bold block ${
              designMode === 'default' ? 'text-blue-700' : 'text-slate-700'
            }`}>
              {t('defaultBadge')}
            </span>
            <span className="text-[10px] text-slate-400">
              {t('simpleDesign')}
            </span>
          </div>
          <div
            onClick={() => {
              setDesignMode('custom');
              setTemplateMode('single');
            }}
            className={`relative p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
              designMode === 'custom'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInfoModalType('custom');
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/50 transition-colors"
            >
              <Info size={14} className="text-slate-400" />
            </button>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              designMode === 'custom' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <FileImage size={18} className={designMode === 'custom' ? 'text-blue-600' : 'text-slate-400'} />
            </div>
            <span className={`text-sm font-bold block ${
              designMode === 'custom' ? 'text-blue-700' : 'text-slate-700'
            }`}>
              {t('myDesign')}
            </span>
            <span className="text-[10px] text-slate-400">
              {t('imageUpload')}
            </span>
          </div>
        </div>

        {/* 내 디자인 모드일 때만 업로드 및 템플릿 목록 표시 */}
        {designMode === 'custom' && (
          <>
            {/* 역할별 디자인 설정 */}
            <button
              onClick={() => setIsMultiTemplateModalOpen(true)}
              className={`w-full mb-3 p-3 rounded-lg border text-left transition-colors ${
                isMultiTemplateConfigured
                  ? 'bg-purple-50 border-purple-200 hover:border-purple-300'
                  : 'bg-amber-50 border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isMultiTemplateConfigured ? 'text-purple-700' : 'text-amber-700'
                }`}>
                  {isMultiTemplateConfigured ? t('roleDesignConfigured') : t('roleDesignSetting')}
                </span>
                <Settings2 size={14} className={isMultiTemplateConfigured ? 'text-purple-400' : 'text-amber-400'} />
              </div>
              {isMultiTemplateConfigured ? (
                <p className="text-[10px] text-purple-600">
                  {t('columnBased', { column: templateColumn, count: roleCounts.length })}
                </p>
              ) : (
                <p className="text-[10px] text-amber-600">
                  {t('clickToSetDesign')}
                </p>
              )}
            </button>

            <div className="space-y-3">
              <TemplateList showDefaultTemplate={false} />
              <TemplateUpload />
            </div>
          </>
        )}

        {/* 기본 명찰 모드일 때 */}
        {designMode === 'default' && (
          <>
            {/* 역할별 디자인 설정 (기본 명찰) */}
            <button
              onClick={() => setIsMultiTemplateModalOpen(true)}
              className={`w-full mb-3 p-3 rounded-lg border text-left transition-colors ${
                isMultiTemplateConfigured
                  ? 'bg-purple-50 border-purple-200 hover:border-purple-300'
                  : 'bg-amber-50 border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  isMultiTemplateConfigured ? 'text-purple-700' : 'text-amber-700'
                }`}>
                  {isMultiTemplateConfigured ? t('roleColorConfigured') : t('roleColorSetting')}
                </span>
                <Settings2 size={14} className={isMultiTemplateConfigured ? 'text-purple-400' : 'text-amber-400'} />
              </div>
              {isMultiTemplateConfigured ? (
                <p className="text-[10px] text-purple-600">
                  {t('columnBased', { column: templateColumn, count: roleCounts.length })}
                </p>
              ) : (
                <p className="text-[10px] text-amber-600">
                  {t('clickToSetColor')}
                </p>
              )}
            </button>

            {/* 기본 명찰 미리보기 */}
            <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-blue-50">
              <div className="aspect-[5/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="w-[90%] h-[90%] border-2 border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden">
                  <div className="bg-blue-500 py-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NAME TAG</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end pb-3">
                    <div className="w-[80%] border-t-2 border-slate-200 mb-2" />
                    <span className="text-slate-400 text-[10px]">Company / Organization</span>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-white border-t border-blue-200">
                <p className="text-xs text-blue-700 font-medium">{t('usingDefaultBadge')}</p>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 멀티 템플릿 설정 모달 */}
      <MultiTemplateModal
        isOpen={isMultiTemplateModalOpen}
        onClose={() => setIsMultiTemplateModalOpen(false)}
        onSave={() => setIsMultiTemplateModalOpen(false)}
      />

      {/* 템플릿 정보 모달 */}
      <TemplateInfoModal
        isOpen={infoModalType !== null}
        onClose={() => setInfoModalType(null)}
        type={infoModalType || 'default'}
      />
    </div>
  );
}
