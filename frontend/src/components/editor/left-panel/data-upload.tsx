'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, PenLine } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Person } from '@/types';
import { ManualEntryModal } from './manual-entry-modal';

export function DataUpload() {
  const { setPersons } = useEditorStore();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const t = useTranslations('editor.dataUpload');
  const tErrors = useTranslations('editor.errors');

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

        // 컬럼 목록 추출
        const columns = Object.keys(jsonData[0]);

        // Person 데이터 생성 (동적 컬럼)
        const newPersons: Person[] = jsonData.map((item) => ({
          id: generateId(),
          data: Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, String(value ?? '')])
          ),
        }));

        // 컬럼 정보와 함께 setPersons 호출
        setPersons(newPersons, columns);
      };
      reader.readAsArrayBuffer(file);
    },
    [setPersons]
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
      <div className="grid grid-cols-2 gap-2">
        {/* 파일 업로드 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <label className="w-full h-full flex flex-col items-center justify-center gap-1.5 cursor-pointer">
            <input
              {...getInputProps()}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleUpload}
            />
            <div className={`p-2 rounded-full transition-colors ${
              isDragActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'
            }`}>
              <FileText size={20} className={isDragActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'} />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold block">
                {isDragActive ? t('dropHere') : t('importFile')}
              </span>
              <span className="text-[10px] text-slate-400">{t('excelCsv')}</span>
            </div>
          </label>
        </div>

        {/* 직접 입력 */}
        <button
          onClick={() => setShowManualEntry(true)}
          className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all group"
        >
          <div className="p-2 rounded-full bg-slate-100 group-hover:bg-green-100 transition-colors">
            <PenLine size={20} className="text-slate-500 group-hover:text-green-600" />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold block">{t('createManually')}</span>
            <span className="text-[10px] text-slate-400">{t('manualEntry')}</span>
          </div>
        </button>
      </div>

      {/* 직접 입력 모달 */}
      <ManualEntryModal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
      />
    </>
  );
}
