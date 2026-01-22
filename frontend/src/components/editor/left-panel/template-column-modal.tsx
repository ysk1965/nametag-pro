'use client';

import { X, Type, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TemplateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  selectedColumn: string | null;
  onSelect: (column: string) => void;
}

export function TemplateColumnModal({
  isOpen,
  onClose,
  columns,
  selectedColumn,
  onSelect,
}: TemplateColumnModalProps) {
  const t = useTranslations('editor.templateColumn');

  if (!isOpen) return null;

  const handleSelect = (col: string) => {
    onSelect(col);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t('title')}</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('description')}
          </p>
        </div>

        {/* 컬럼 목록 */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {columns.map((col) => {
            const isSelected = selectedColumn === col;
            return (
              <button
                key={col}
                onClick={() => handleSelect(col)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-400' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Type size={16} />
                </div>
                <span className="flex-1 text-sm font-medium truncate">
                  {col}
                </span>
                {isSelected && <Check size={18} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
