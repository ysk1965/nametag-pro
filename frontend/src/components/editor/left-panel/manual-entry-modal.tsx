'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Person } from '@/types';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
  const { setPersons } = useEditorStore();
  const t = useTranslations('editor.manualEntry');

  // 기본 컬럼: 이름
  const defaultColumn = t('defaultColumn');
  const [columns, setColumns] = useState<string[]>([defaultColumn]);
  // 기본 행: 빈 데이터 1개
  const [rows, setRows] = useState<Record<string, string>[]>([{ [defaultColumn]: '' }]);
  // 새 행 추가 시 포커스 이동을 위한 상태
  const [focusNewRow, setFocusNewRow] = useState(false);
  const lastRowFirstInputRef = useRef<HTMLInputElement>(null);

  // 새 행 추가 후 포커스 이동
  useEffect(() => {
    if (focusNewRow && lastRowFirstInputRef.current) {
      lastRowFirstInputRef.current.focus();
      setFocusNewRow(false);
    }
  }, [focusNewRow, rows.length]);

  const handleAddColumn = useCallback(() => {
    const newColumnName = t('newColumn', { number: columns.length + 1 });
    setColumns([...columns, newColumnName]);
    setRows(rows.map(row => ({ ...row, [newColumnName]: '' })));
  }, [columns, rows, t]);

  const handleRemoveColumn = useCallback((index: number) => {
    if (columns.length <= 1) return; // 최소 1개 컬럼 유지

    const columnToRemove = columns[index];
    const newColumns = columns.filter((_, i) => i !== index);
    const newRows = rows.map(row => {
      const { [columnToRemove]: _, ...rest } = row;
      return rest;
    });

    setColumns(newColumns);
    setRows(newRows);
  }, [columns, rows]);

  const handleColumnNameChange = useCallback((index: number, newName: string) => {
    const oldName = columns[index];
    if (oldName === newName) return;

    // 중복 이름 방지
    if (columns.some((col, i) => i !== index && col === newName)) {
      return;
    }

    const newColumns = [...columns];
    newColumns[index] = newName;

    // 행 데이터의 키도 업데이트
    const newRows = rows.map(row => {
      const { [oldName]: value, ...rest } = row;
      return { ...rest, [newName]: value || '' };
    });

    setColumns(newColumns);
    setRows(newRows);
  }, [columns, rows]);

  const handleAddRow = useCallback(() => {
    const newRow: Record<string, string> = {};
    columns.forEach(col => {
      newRow[col] = '';
    });
    setRows([...rows, newRow]);
    setFocusNewRow(true);
  }, [columns, rows]);

  const handleRemoveRow = useCallback((index: number) => {
    if (rows.length <= 1) return; // 최소 1개 행 유지
    setRows(rows.filter((_, i) => i !== index));
  }, [rows]);

  const handleCellChange = useCallback((rowIndex: number, column: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [column]: value };
    setRows(newRows);
  }, [rows]);

  const handleSave = useCallback(() => {
    // 빈 행 필터링 (모든 값이 빈 경우)
    const validRows = rows.filter(row =>
      Object.values(row).some(value => value.trim() !== '')
    );

    if (validRows.length === 0) {
      alert(t('minDataRequired'));
      return;
    }

    // Person 데이터 생성
    const newPersons: Person[] = validRows.map(row => ({
      id: generateId(),
      data: row,
    }));

    setPersons(newPersons, columns);

    // 모달 닫기 및 초기화
    onClose();
    setColumns([defaultColumn]);
    setRows([{ [defaultColumn]: '' }]);
  }, [columns, rows, setPersons, onClose, defaultColumn]);

  const handleClose = useCallback(() => {
    onClose();
    // 초기화
    setColumns([defaultColumn]);
    setRows([{ [defaultColumn]: '' }]);
  }, [onClose, defaultColumn]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{t('title')}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <p className="text-sm text-slate-500 mb-4">
            {t('description')}
          </p>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-10 p-2 border-r text-center text-slate-400">#</th>
                  {columns.map((col, colIndex) => (
                    <th key={colIndex} className="p-2 border-r last:border-r-0 min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={col}
                          onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                          className="flex-1 px-2 py-1 text-center font-bold bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white rounded outline-none transition-colors"
                        />
                        {columns.length > 1 && (
                          <button
                            onClick={() => handleRemoveColumn(colIndex)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-16 p-2">
                    <button
                      onClick={handleAddColumn}
                      className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded font-medium"
                    >
                      <Plus size={14} />
                      {t('addColumn')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t hover:bg-slate-50/50">
                    <td className="p-2 border-r text-center text-slate-400 font-medium">
                      {rowIndex + 1}
                    </td>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="p-1 border-r last:border-r-0">
                        <input
                          ref={rowIndex === rows.length - 1 && colIndex === 0 ? lastRowFirstInputRef : undefined}
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                              e.preventDefault();
                              handleAddRow();
                            }
                          }}
                          placeholder={col}
                          className="w-full px-2 py-1.5 bg-white text-slate-700 border border-slate-200 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
                        />
                      </td>
                    ))}
                    <td className="p-2">
                      {rows.length > 1 && (
                        <button
                          onClick={() => handleRemoveRow(rowIndex)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            {t('addRow')}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
          <span className="text-sm text-slate-500">
            {t('summary', { columns: columns.length, rows: rows.length })}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
