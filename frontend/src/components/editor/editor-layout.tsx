'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileDown, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor-store';
import { LeftPanel } from './left-panel';
import { CenterPanel } from './center-panel';
import { RightPanel } from './right-panel';
import { ProgressModal } from './progress-modal';
import { ExportSettingsModal } from './export-settings-modal';
import { OnboardingModal } from './onboarding-modal';
import { TemplateSelectionModal } from './template-selection-modal';
import { RoleDesignGuideModal } from './role-design-guide-modal';
import { BlankPagesModal } from './blank-pages-modal';
import { useMediaQuery } from '@/hooks/use-media-query';
import { generatePDF } from '@/lib/pdf-generator';
import { Link } from '@/i18n/routing';

export function EditorLayout() {
  const router = useRouter();
  const t = useTranslations('editor');
  const tErrors = useTranslations('editor.errors');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'settings'>('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isRoleGuideModalOpen, setIsRoleGuideModalOpen] = useState(false);
  const [roleGuideInitialStep, setRoleGuideInitialStep] = useState<'upload' | 'mapping'>('upload');
  const [isBlankPagesModalOpen, setIsBlankPagesModalOpen] = useState(false);
  const [hasShownTemplateModal, setHasShownTemplateModal] = useState(false);
  const [prevPersonsCount, setPrevPersonsCount] = useState(0);
  const [prevCustomTemplateCount, setPrevCustomTemplateCount] = useState(0);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const {
    templates,
    persons,
    textConfig,
    exportConfig,
    roleMappings,
    roleColors,
    templateColumn,
    templateMode,
    designMode,
    selectedTemplateId,
    textFields,
    setGeneratedPdfUrl,
    canGenerate,
    ensureDefaultTemplate,
  } = useEditorStore();

  // 마운트 시 기본 템플릿 보장
  useEffect(() => {
    ensureDefaultTemplate();
  }, [ensureDefaultTemplate]);

  // 명단이 추가되면 템플릿 선택 모달 표시 (단, 커스텀 템플릿이 없을 때만)
  useEffect(() => {
    const hasCustomTemplates = templates.some(t => t.id !== 'default-template');

    if (persons.length > 0 && prevPersonsCount === 0 && !hasShownTemplateModal && !hasCustomTemplates) {
      // 약간의 딜레이 후 모달 표시 (온보딩 모달이 닫히는 것을 기다림)
      const timer = setTimeout(() => {
        setIsTemplateModalOpen(true);
        setHasShownTemplateModal(true);
      }, 300);
      return () => clearTimeout(timer);
    }
    setPrevPersonsCount(persons.length);
  }, [persons.length, prevPersonsCount, hasShownTemplateModal, templates]);

  // 템플릿 선택 모달에서 업로드 완료 시 역할별 디자인 모달 표시
  const handleTemplateUploadComplete = useCallback((uploadedCount: number) => {
    // 업로드된 이미지 개수에 따라 초기 step 결정
    // 2개 이상이면 바로 매핑 단계로
    const initialStep = uploadedCount >= 2 ? 'mapping' : 'upload';
    setRoleGuideInitialStep(initialStep);

    // 약간의 딜레이 후 모달 표시
    setTimeout(() => {
      setIsRoleGuideModalOpen(true);
    }, 100);
  }, []);

  // 커스텀 템플릿 수 추적 (외부에서 추가된 경우 대응)
  useEffect(() => {
    const customTemplateCount = templates.filter(t => t.id !== 'default-template').length;
    setPrevCustomTemplateCount(customTemplateCount);
  }, [templates]);

  const handleProgress = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  const handleOpenExportModal = () => {
    if (!canGenerate()) return;
    setIsExportModalOpen(true);
  };

  // 출력 설정에서 생성 버튼 클릭 시 → 빈 페이지 설정 모달
  const handleExportGenerate = () => {
    setIsExportModalOpen(false);
    setIsBlankPagesModalOpen(true);
  };

  // 빈 페이지 설정 후 실제 생성
  const handleBlankPagesConfirm = (blankPagesData: { blankPages?: number; blankPagesPerTemplate?: Record<string, number> }) => {
    setIsBlankPagesModalOpen(false);
    executeGenerate(blankPagesData);
  };

  const executeGenerate = async (blankPagesData?: { blankPages?: number; blankPagesPerTemplate?: Record<string, number> }) => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: persons.length });

    try {
      // 빈 명찰 데이터를 exportConfig에 병합
      const finalExportConfig = blankPagesData
        ? { ...exportConfig, ...blankPagesData }
        : exportConfig;

      const pdfUrl = await generatePDF(
        templates,
        persons,
        textConfig,
        finalExportConfig,
        roleMappings,
        templateMode === 'multi' ? templateColumn : null,
        textFields,
        handleProgress,
        templateMode === 'single' ? selectedTemplateId : null,
        designMode === 'default' && templateMode === 'multi' ? roleColors : {}
      );
      setGeneratedPdfUrl(pdfUrl);
      router.push('/result');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(tErrors('pdfGenerationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };


  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  // 빈 명찰 총합 계산
  const customTemplates = templates.filter(t => t.id !== 'default-template');
  const hasMultipleTemplates = customTemplates.length > 1;
  const totalBlankPages = hasMultipleTemplates
    ? customTemplates.reduce((sum, t) => sum + (exportConfig.blankPagesPerTemplate?.[t.id] || 0), 0)
    : exportConfig.blankPages || 0;

  // Desktop layout
  if (isDesktop) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-slate-600">
              <ChevronLeft />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg">{t('header.newProject')}</h1>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border uppercase font-semibold">
                {t('header.draft')}
              </span>
            </div>
          </div>
          <Button
            disabled={!canGenerate() || isGenerating}
            onClick={handleOpenExportModal}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <FileDown size={20} />
            )}
            {t('header.generatePdf')}
          </Button>
        </header>

        {/* Main content */}
        <main className="flex flex-1 overflow-hidden">
          <aside className="w-80 border-r bg-white flex flex-col shrink-0 overflow-hidden">
            <LeftPanel />
          </aside>
          <div className="flex-1 overflow-hidden">
            <CenterPanel />
          </div>
          <aside className="w-80 border-l bg-white flex flex-col shrink-0 overflow-hidden">
            <RightPanel />
          </aside>
        </main>

        {/* Export Settings Modal */}
        <ExportSettingsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onGenerate={handleExportGenerate}
          isGenerating={isGenerating}
        />

        {/* Progress Modal */}
        <ProgressModal
          isOpen={isGenerating}
          progress={progressPercent}
          current={progress.current}
          total={progress.total}
          blankPages={totalBlankPages}
        />

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={isOnboardingOpen && persons.length === 0}
          onClose={() => setIsOnboardingOpen(false)}
        />

        {/* Template Selection Modal */}
        <TemplateSelectionModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onUploadComplete={handleTemplateUploadComplete}
        />

        {/* Role Design Guide Modal */}
        <RoleDesignGuideModal
          isOpen={isRoleGuideModalOpen}
          onClose={() => setIsRoleGuideModalOpen(false)}
          initialStep={roleGuideInitialStep}
        />

        {/* Blank Pages Modal */}
        <BlankPagesModal
          isOpen={isBlankPagesModalOpen}
          onClose={() => setIsBlankPagesModalOpen(false)}
          onConfirm={handleBlankPagesConfirm}
        />
      </div>
    );
  }

  // Mobile layout with tabs
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0 z-10">
        <Link href="/" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold">{t('header.editor')}</h1>
        <Button
          size="sm"
          disabled={!canGenerate() || isGenerating}
          onClick={handleOpenExportModal}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : t('header.generatePdf').split(' ')[0]}
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'upload' && <LeftPanel />}
        {activeTab === 'preview' && <CenterPanel />}
        {activeTab === 'settings' && <RightPanel />}
      </div>

      {/* Bottom tabs */}
      <nav className="h-14 border-t bg-white flex shrink-0">
        {(['upload', 'preview', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </nav>

      {/* Export Settings Modal */}
      <ExportSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onGenerate={handleExportGenerate}
        isGenerating={isGenerating}
      />

      {/* Progress Modal */}
      <ProgressModal
        isOpen={isGenerating}
        progress={progressPercent}
        current={progress.current}
        total={progress.total}
        blankPages={totalBlankPages}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen && persons.length === 0}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onUploadComplete={handleTemplateUploadComplete}
      />

      {/* Role Design Guide Modal */}
      <RoleDesignGuideModal
        isOpen={isRoleGuideModalOpen}
        onClose={() => setIsRoleGuideModalOpen(false)}
        initialStep={roleGuideInitialStep}
      />

      {/* Blank Pages Modal */}
      <BlankPagesModal
        isOpen={isBlankPagesModalOpen}
        onClose={() => setIsBlankPagesModalOpen(false)}
        onConfirm={handleBlankPagesConfirm}
      />
    </div>
  );
}
