'use client';

import { useState } from 'react';
import { Trash2, Edit3, ChevronRight } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { RosterEditModal } from './roster-edit-modal';

export function DataPreview() {
  const { persons, columns, textFields, templateColumn, clearPersons } = useEditorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 표시할 컬럼 결정 (텍스트 필드 컬럼 우선, 없으면 처음 2개)
  const displayColumns = textFields.length > 0
    ? textFields.slice(0, 2).map(f => f.column)
    : columns.slice(0, 2);

  return (
    <>
      <div className="border rounded-lg bg-white overflow-hidden">
        {/* 헤더 */}
        <div className="bg-slate-50 px-3 py-2 border-b flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            {persons.length}명
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-slate-400 hover:text-blue-500 transition-colors p-1"
              title="편집"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={clearPersons}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 테이블 - 클릭하면 모달 열림 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full text-left hover:bg-slate-50 transition-colors"
        >
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <tbody className="divide-y">
                {persons.slice(0, 10).map((person) => (
                  <tr key={person.id}>
                    {displayColumns.map((col, idx) => (
                      <td
                        key={col}
                        className={`px-3 py-2 ${idx === 0 ? 'font-medium' : 'text-slate-400'}`}
                      >
                        {person.data[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 더보기 */}
          {persons.length > 10 && (
            <div className="px-3 py-2 border-t bg-slate-50 flex items-center justify-center gap-1 text-xs text-blue-600 font-medium">
              <span>+ {persons.length - 10}명 더보기</span>
              <ChevronRight size={14} />
            </div>
          )}

          {/* 모든 데이터가 10명 이하일 때도 편집 안내 */}
          {persons.length <= 10 && (
            <div className="px-3 py-2 border-t bg-slate-50 flex items-center justify-center gap-1 text-xs text-slate-400">
              <span>클릭하여 편집</span>
              <ChevronRight size={14} />
            </div>
          )}
        </button>
      </div>

      {/* 편집 모달 */}
      <RosterEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
