'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Type, Plus, X, Check } from 'lucide-react';

export function ColumnConfig() {
  const {
    columns,
    textFields,
    addTextField,
    removeTextField,
    setSelectedTextField,
  } = useEditorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (columns.length === 0) {
    return null;
  }

  // 텍스트 필드로 사용 중인 컬럼들
  const textFieldColumns = textFields.map((f) => f.column);

  // 선택 가능한 컬럼 (텍스트 필드에 추가 가능)
  const availableForText = columns.filter((col) => !textFieldColumns.includes(col));

  const handleAddColumn = (col: string) => {
    addTextField(col);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* 텍스트 필드 설정 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Type size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-600">표시할 컬럼</span>
          </div>
          <div className="space-y-1.5">
            {textFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-md group"
              >
                <span className="text-xs text-blue-400 w-4">{index + 1}</span>
                <button
                  onClick={() => setSelectedTextField(field.id)}
                  className="flex-1 text-left text-sm text-blue-700 font-medium truncate hover:underline"
                >
                  {field.column}
                </button>
                {textFields.length > 1 && (
                  <button
                    onClick={() => removeTextField(field.id)}
                    className="p-0.5 text-blue-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}

            {/* 컬럼 추가 버튼 */}
            {availableForText.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-md text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus size={14} />
                컬럼 추가
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            선택한 컬럼이 명찰에 표시됩니다
          </p>
        </div>
      </div>

      {/* 컬럼 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* 백드롭 */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />

          {/* 모달 */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* 헤더 */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">컬럼 추가</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                명찰에 표시할 컬럼을 선택하세요. 선택한 컬럼의 데이터가 명찰에 텍스트로 표시됩니다.
              </p>
            </div>

            {/* 컬럼 목록 */}
            <div className="p-2 max-h-80 overflow-y-auto">
              {availableForText.map((col) => (
                <button
                  key={col}
                  onClick={() => handleAddColumn(col)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Type size={16} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                    {col}
                  </span>
                </button>
              ))}
            </div>

            {/* 이미 추가된 컬럼 */}
            {textFieldColumns.length > 0 && (
              <div className="px-4 py-3 border-t bg-slate-50">
                <p className="text-[10px] text-slate-400 mb-2">이미 추가된 컬럼</p>
                <div className="flex flex-wrap gap-1">
                  {textFieldColumns.map((col) => (
                    <span key={col} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
