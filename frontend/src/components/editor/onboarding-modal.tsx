'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileText, PenLine, X, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Person } from '@/types';
import { ManualEntryModal } from './left-panel/manual-entry-modal';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { setPersons, persons } = useEditorStore();
  const t = useTranslations('editor.onboarding');
  const tErrors = useTranslations('editor.errors');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // 닫기 애니메이션 처리
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // 애니메이션이 끝난 후 실제로 닫기
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  // 명단이 생성되면 모달 닫기
  useEffect(() => {
    if (persons.length > 0 && isOpen) {
      onClose();
    }
  }, [persons.length, isOpen, onClose]);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (!result) return;

        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        if (jsonData.length === 0) {
          alert(tErrors('noDataInFile'));
          return;
        }

        const columns = Object.keys(jsonData[0]);
        const newPersons: Person[] = jsonData.map((item) => ({
          id: generateId(),
          data: Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, String(value ?? '')])
          ),
        }));

        setPersons(newPersons, columns);
      };
      reader.readAsArrayBuffer(file);
    },
    [setPersons, tErrors]
  );

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    noClick: true,
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isClosing ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={
                isClosing
                  ? {
                      opacity: 0,
                      scale: 0.2,
                      x: -400,
                      y: -150,
                      transition: {
                        duration: 0.4,
                        ease: [0.32, 0, 0.67, 0],
                      },
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: 0,
                    }
              }
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 pt-8 pb-4 text-center bg-gradient-to-b from-blue-50 to-white">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center"
                >
                  <FileText size={32} className="text-blue-600" />
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
                  {t('subtitle')}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* 파일 가져오기 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                    <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                      <input
                        {...getInputProps()}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleUpload}
                      />
                      <div className={`p-4 rounded-full transition-colors ${
                        isDragActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'
                      }`}>
                        <FileText size={28} className={isDragActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'} />
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-bold block mb-1 ${isDragActive ? 'text-blue-600' : 'text-slate-700'}`}>
                          {isDragActive ? t('dropHere') : t('importFile')}
                        </span>
                        <span className="text-xs text-slate-400">{t('excelCsv')}</span>
                      </div>
                    </label>
                    </div>
                  </motion.div>

                  {/* 직접 만들기 */}
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowManualEntry(true)}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors group"
                  >
                    <div className="p-4 rounded-full bg-slate-100 group-hover:bg-green-100 transition-colors">
                      <PenLine size={28} className="text-slate-400 group-hover:text-green-600" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-slate-700 block mb-1">{t('createManually')}</span>
                      <span className="text-xs text-slate-400">{t('manualEntry')}</span>
                    </div>
                  </motion.button>
                </div>

                {/* 건너뛰기 */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  onClick={handleClose}
                  className="mt-6 w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
                >
                  {t('later')}
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 직접 입력 모달 */}
      <ManualEntryModal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
      />
    </>
  );
}
