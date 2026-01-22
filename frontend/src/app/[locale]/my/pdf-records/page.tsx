'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, FileText, Download, Trash2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { getMyPdfRecords, downloadPdf, deletePdfRecord, type PdfRecordResponse } from '@/lib/pdf-api';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function PdfRecordsPage() {
  const router = useRouter();
  const t = useTranslations('pdfRecords');
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [records, setRecords] = useState<PdfRecordResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      loadRecords();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyPdfRecords();
      setRecords(data);
    } catch (err) {
      setError(t('loadError'));
      console.error('Failed to load PDF records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (record: PdfRecordResponse) => {
    try {
      setDownloadingId(record.id);
      const blob = await downloadPdf(record.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.projectName || 'nametag'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert(t('downloadError'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (record: PdfRecordResponse) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      setDeletingId(record.id);
      await deletePdfRecord(record.id);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
    } catch (err) {
      console.error('Failed to delete PDF record:', err);
      alert(t('deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-600">
            <ChevronLeft />
          </Link>
          <h1 className="font-bold text-lg">{t('title')}</h1>
        </div>
        <Button onClick={() => router.push('/editor')} variant="outline">
          {t('newPdf')}
        </Button>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={loadRecords}>{t('retry')}</Button>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="text-slate-300 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('noRecords')}</h2>
            <p className="text-slate-500 mb-6">{t('noRecordsDesc')}</p>
            <Button onClick={() => router.push('/editor')}>{t('createFirst')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-6">
              {t('recordsCount', { count: records.length })}
            </p>

            <AnimatePresence>
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {record.projectName || t('untitled')}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span>{t('nametagCount', { count: record.nametagCount })}</span>
                          <span>{t('pageCount', { count: record.pageCount })}</span>
                          {record.watermarkEnabled && (
                            <span className="text-purple-600">{t('hasWatermark')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                          <Clock size={12} />
                          <span>{formatDate(record.createdAt)}</span>
                          <span className="mx-1">·</span>
                          <span className={record.daysUntilExpiry <= 7 ? 'text-orange-500' : ''}>
                            {t('expiresIn', { days: record.daysUntilExpiry })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(record)}
                        disabled={downloadingId === record.id}
                      >
                        {downloadingId === record.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Download size={16} />
                        )}
                        <span className="ml-1 hidden sm:inline">{t('download')}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        disabled={deletingId === record.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        {deletingId === record.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
