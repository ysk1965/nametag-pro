'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Type, Plus, X, Check, Settings2 } from 'lucide-react';

export function ColumnConfig() {
  const {
    columns,
    textFields,
    showColumnConfigModal,
    addTextField,
    removeTextField,
    setSelectedTextField,
    setShowColumnConfigModal,
  } = useEditorStore();

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // 텍스트 필드로 사용 중인 컬럼들
  const textFieldColumns = textFields.map((f) => f.column);

  // 모달이 열릴 때 선택 상태 초기화
  useEffect(() => {
    if (showColumnConfigModal) {
      setSelectedColumns([...textFieldColumns]);
    }
  }, [showColumnConfigModal]);

  if (columns.length === 0) {
    return null;
  }

  const handleToggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  const handleConfirm = () => {
    // 추가할 컬럼: 선택됐는데 아직 추가 안 된 것
    const toAdd = selectedColumns.filter((col) => !textFieldColumns.includes(col));
    // 삭제할 컬럼: 기존에 있었는데 선택 해제된 것
    const toRemove = textFieldColumns.filter((col) => !selectedColumns.includes(col));

    toAdd.forEach((col) => addTextField(col));
    toRemove.forEach((col) => {
      const field = textFields.find((f) => f.column === col);
      if (field) removeTextField(field.id);
    });

    setShowColumnConfigModal(false);
  };

  const handleOpenModal = () => {
    // 모달 열 때 현재 추가된 컬럼들을 선택 상태로 초기화
    setSelectedColumns([...textFieldColumns]);
    setShowColumnConfigModal(true);
  };

  const handleCloseModal = () => {
    setShowColumnConfigModal(false);
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

            {/* 컬럼 설정 버튼 */}
            <button
              onClick={handleOpenModal}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-md text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Settings2 size={14} />
              컬럼 설정
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            선택한 컬럼이 명찰에 표시됩니다
          </p>
        </div>
      </div>

      {/* 컬럼 추가 모달 */}
      {showColumnConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* 백드롭 */}
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />

          {/* 모달 */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* 헤더 */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">표시할 컬럼 선택</h3>
                <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                명찰에 표시할 컬럼을 선택하세요. 선택한 컬럼의 데이터가 명찰에 텍스트로 표시됩니다.
              </p>
            </div>

            {/* 컬럼 목록 - 모든 컬럼 표시 */}
            <div className="p-2 max-h-80 overflow-y-auto">
              {columns.map((col) => {
                const isSelected = selectedColumns.includes(col);
                return (
                  <button
                    key={col}
                    onClick={() => handleToggleColumn(col)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* 체크박스 */}
                    <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Type size={16} />
                    </div>
                    <span className={`flex-1 text-sm font-medium truncate ${
                      isSelected ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {col}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 완료 버튼 */}
            <div className="px-4 py-3 border-t">
              <button
                onClick={handleConfirm}
                disabled={selectedColumns.length === 0}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                  selectedColumns.length > 0
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {selectedColumns.length > 0
                  ? `완료 (${selectedColumns.length}개 선택)`
                  : '최소 1개 이상 선택하세요'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
