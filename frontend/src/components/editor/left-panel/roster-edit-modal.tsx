'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '@/components/ui/button';
import { generateId } from '@/lib/utils';
import type { Person } from '@/types';

interface RosterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RosterEditModal({ isOpen, onClose }: RosterEditModalProps) {
  const { persons, columns, setPersons, setColumns } = useEditorStore();
  const [editedPersons, setEditedPersons] = useState<Person[]>([]);
  const [editedColumns, setEditedColumns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 모달 열릴 때 데이터 복사
  useEffect(() => {
    if (isOpen) {
      setEditedPersons(persons.map(p => ({
        ...p,
        data: { ...p.data }
      })));
      setEditedColumns([...columns]);
      setHasChanges(false);
      setSearchQuery('');
    }
  }, [isOpen, persons, columns]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // 검색 필터 (모든 컬럼에서 검색)
  const filteredPersons = editedPersons.filter((p) =>
    Object.values(p.data).some(value =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // 셀 값 수정
  const handleCellChange = useCallback((id: string, column: string, value: string) => {
    setEditedPersons((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, data: { ...p.data, [column]: value } } : p
      )
    );
    setHasChanges(true);
  }, []);

  // 행 삭제
  const handleDelete = useCallback((id: string) => {
    setEditedPersons((prev) => prev.filter((p) => p.id !== id));
    setHasChanges(true);
  }, []);

  // 행 추가
  const handleAdd = useCallback(() => {
    const newPerson: Person = {
      id: generateId(),
      data: Object.fromEntries(editedColumns.map(col => [col, ''])),
    };
    setEditedPersons((prev) => [...prev, newPerson]);
    setHasChanges(true);
  }, [editedColumns]);

  // 컬럼 삭제
  const handleDeleteColumn = useCallback((columnToDelete: string) => {
    // 최소 1개 컬럼은 유지
    if (editedColumns.length <= 1) {
      alert('최소 1개의 컬럼이 필요합니다.');
      return;
    }

    // 컬럼 목록에서 제거
    setEditedColumns((prev) => prev.filter((col) => col !== columnToDelete));

    // 모든 사람의 데이터에서 해당 컬럼 제거
    setEditedPersons((prev) =>
      prev.map((p) => {
        const newData = { ...p.data };
        delete newData[columnToDelete];
        return { ...p, data: newData };
      })
    );

    setHasChanges(true);
  }, [editedColumns.length]);

  // 저장
  const handleSave = () => {
    // 첫 번째 컬럼이 비어있지 않은 행만 저장
    const firstColumn = editedColumns[0];
    const validPersons = editedPersons.filter((p) =>
      firstColumn ? p.data[firstColumn]?.trim() : true
    );
    setPersons(validPersons, editedColumns);
    setColumns(editedColumns);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col mx-4 animate-fade-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">명단 편집</h2>
            <p className="text-sm text-slate-500">
              총 {editedPersons.length}명 · {editedColumns.length}개 컬럼
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* 툴바 */}
        <div className="flex items-center gap-3 px-6 py-3 border-b bg-slate-50">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 추가 버튼 */}
          <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1">
            <Plus size={16} />
            추가
          </Button>
        </div>

        {/* 테이블 */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                  #
                </th>
                {editedColumns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div className="flex items-center gap-1 group">
                      <span>{col}</span>
                      <button
                        onClick={() => handleDeleteColumn(col)}
                        className="p-0.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title={`${col} 컬럼 삭제`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-16">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPersons.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 text-sm text-slate-400">
                    {editedPersons.indexOf(person) + 1}
                  </td>
                  {editedColumns.map((col) => (
                    <td key={col} className="px-4 py-2">
                      <input
                        type="text"
                        value={person.data[col] || ''}
                        onChange={(e) => handleCellChange(person.id, col, e.target.value)}
                        placeholder={col}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPersons.length === 0 && (
                <tr>
                  <td colSpan={editedColumns.length + 2} className="px-6 py-12 text-center text-slate-400">
                    {searchQuery ? '검색 결과가 없습니다' : '명단이 비어있습니다'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
          <div className="text-sm text-slate-500">
            {hasChanges && (
              <span className="text-amber-600 font-medium">변경사항이 있습니다</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
