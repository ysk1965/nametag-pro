'use client';

import { useState } from 'react';
import { Trash2, Edit3, Users, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { RosterEditModal } from './roster-edit-modal';

export function DataPreview() {
  const { persons, columns, textFields, clearPersons } = useEditorStore();
  const t = useTranslations('editor.dataPreview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 표시할 컬럼 결정 (텍스트 필드 컬럼 우선, 없으면 처음 2개)
  const displayColumns = textFields.length > 0
    ? textFields.slice(0, 2).map(f => f.column)
    : columns.slice(0, 2);

  // 첫 번째 사람의 이름 (미리보기용)
  const firstPersonName = persons[0]?.data[displayColumns[0]] || '';

  return (
    <>
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">
              {t('persons', { count: persons.length })}
            </span>
            {firstPersonName && (
              <span className="text-xs text-slate-400">
                {t('andOthers', { name: firstPersonName })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-slate-400 hover:text-blue-500 transition-colors p-1.5 hover:bg-slate-100 rounded"
              title={t('edit')}
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-slate-100 rounded"
              title={t('delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 편집 모달 */}
      <RosterEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{t('deleteRoster')}</h3>
              <p className="text-sm text-slate-500 mb-4">
                {t('deleteConfirm', { count: persons.length })}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    clearPersons();
                    setIsDeleteModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
