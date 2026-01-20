'use client';

import { useCallback, useState } from 'react';
import { FileText, PenLine } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Person } from '@/types';
import { ManualEntryModal } from './manual-entry-modal';

export function DataUpload() {
  const { setPersons } = useEditorStore();
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

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
          alert('파일에 데이터가 없습니다.');
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

      // Reset input
      e.target.value = '';
    },
    [setPersons]
  );

  return (
    <>
      <div className="space-y-3">
        {/* 파일 업로드 */}
        <label className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleUpload}
          />
          <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
            <FileText size={24} className="text-slate-500 group-hover:text-blue-600" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold block mb-0.5">명단 가져오기</span>
            <span className="text-xs text-slate-400">Excel 또는 CSV 파일</span>
          </div>
        </label>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400">또는</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* 직접 입력 */}
        <button
          onClick={() => setShowManualEntry(true)}
          className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all group"
        >
          <div className="p-2 rounded-full bg-slate-100 group-hover:bg-green-100 transition-colors">
            <PenLine size={20} className="text-slate-500 group-hover:text-green-600" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">직접 만들기</span>
            <span className="text-xs text-slate-400">컬럼과 데이터 직접 입력</span>
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
