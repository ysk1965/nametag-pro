'use client';

import { useEffect, useState } from 'react';
import {
  Download,
  ChevronLeft,
  CheckCircle2,
  Share2,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor-store';
import { calculatePageCount } from '@/lib/pdf-generator';
import { Link, useRouter } from '@/i18n/routing';

export default function ResultPage() {
  const router = useRouter();
  const t = useTranslations('result');
  const { persons, exportConfig, generatedPdfUrl } = useEditorStore();
  const [isMounted, setIsMounted] = useState(false);

  // 마운트 상태 추적 (hydration 에러 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if no PDF
  useEffect(() => {
    if (isMounted && !generatedPdfUrl) {
      router.push('/editor');
    }
  }, [generatedPdfUrl, router, isMounted]);

  // 서버/클라이언트 렌더링 일치를 위해 마운트 전에는 로딩 표시
  if (!isMounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center space-y-6 min-h-screen">
        <Loader2 className="animate-spin text-slate-400" size={48} />
      </div>
    );
  }

  if (!generatedPdfUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center space-y-6 min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-full">
          <FileText size={48} />
        </div>
        <h2 className="text-2xl font-bold">{t('noPdfFound')}</h2>
        <p className="text-slate-500">{t('goBackToEditor')}</p>
        <Link href="/editor">
          <Button className="gap-2">
            <ChevronLeft size={20} /> {t('backToEditor')}
          </Button>
        </Link>
      </div>
    );
  }

  const pageCount = calculatePageCount(persons.length, exportConfig.layout);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/editor" className="text-slate-400 hover:text-slate-600">
            <ChevronLeft />
          </Link>
          <h1 className="font-bold text-lg">{t('exportResult')}</h1>
        </div>
        <a href={generatedPdfUrl} download="nametags.pdf">
          <Button className="gap-2">
            <Download size={20} />
            {t('downloadPdf')}
          </Button>
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-12">
        {/* Success message */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('yourNametagsReady')}
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t('generatedDescription', {
              count: persons.length,
              pages: pageCount,
              layout: exportConfig.layout,
            })}
          </p>
        </div>

        {/* Preview and info */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* PDF Preview */}
          <div className="bg-white p-2 border shadow-xl rounded-lg group relative overflow-hidden">
            <iframe
              src={generatedPdfUrl}
              className="w-full aspect-[1/1.4] border-0 rounded"
              title="PDF Preview"
            />
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border space-y-6">
              <h3 className="font-bold text-lg border-b pb-4">
                {t('projectSummary')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('totalNametags')}</span>
                  <span className="font-bold">{persons.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('pages')}</span>
                  <span className="font-bold">{pageCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('layout')}</span>
                  <span className="font-bold">{exportConfig.layout}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('paperSize')}</span>
                  <span className="font-bold">{exportConfig.paperSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t('resolution')}</span>
                  <span className="font-bold">{exportConfig.dpi} DPI</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="gap-2">
                <Share2 size={18} /> {t('share')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail size={18} /> {t('emailMe')}
              </Button>
            </div>

            {/* Printing tips */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
              <h4 className="font-bold text-blue-900">{t('printingTips')}</h4>
              <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                <li>{t('printingTip1')}</li>
                <li>{t('printingTip2')}</li>
                <li>{t('printingTip3')}</li>
              </ul>
            </div>

            {/* New project */}
            <Link href="/editor" className="block">
              <Button variant="secondary" className="w-full">
                {t('createNewProject')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
