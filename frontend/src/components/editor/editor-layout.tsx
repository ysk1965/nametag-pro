'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor-store';
import { LeftPanel } from './left-panel';
import { CenterPanel } from './center-panel';
import { RightPanel } from './right-panel';
import { ProgressModal } from './progress-modal';
import { useMediaQuery } from '@/hooks/use-media-query';
import { generatePDF } from '@/lib/pdf-generator';

export function EditorLayout() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'settings'>('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const {
    templates,
    persons,
    textConfig,
    exportConfig,
    roleMappings,
    templateColumn,
    textFields,
    setGeneratedPdfUrl,
    canGenerate,
    ensureDefaultTemplate,
  } = useEditorStore();

  // 마운트 시 기본 템플릿 보장
  useEffect(() => {
    ensureDefaultTemplate();
  }, [ensureDefaultTemplate]);

  const handleProgress = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setProgress({ current: 0, total: persons.length });

    try {
      const pdfUrl = await generatePDF(
        templates,
        persons,
        textConfig,
        exportConfig,
        roleMappings,
        templateColumn,
        textFields,
        handleProgress
      );
      setGeneratedPdfUrl(pdfUrl);
      router.push('/result');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

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
              <h1 className="font-bold text-lg">New Project</h1>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border uppercase font-semibold">
                Draft
              </span>
            </div>
          </div>
          <Button
            disabled={!canGenerate() || isGenerating}
            onClick={handleGenerate}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <FileDown size={20} />
            )}
            Generate PDF
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

        {/* Progress Modal */}
        <ProgressModal
          isOpen={isGenerating}
          progress={progressPercent}
          current={progress.current}
          total={progress.total}
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
        <h1 className="font-bold">Editor</h1>
        <Button
          size="sm"
          disabled={!canGenerate() || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Generate'}
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
            {tab}
          </button>
        ))}
      </nav>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={isGenerating}
        progress={progressPercent}
        current={progress.current}
        total={progress.total}
      />
    </div>
  );
}
