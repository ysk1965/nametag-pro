'use client';

import { useEditorStore } from '@/stores/editor-store';
import { Type, Layers, Plus, X, Check } from 'lucide-react';

export function ColumnConfig() {
  const {
    columns,
    textFields,
    templateColumn,
    addTextField,
    removeTextField,
    setTemplateColumn,
    setSelectedTextField,
  } = useEditorStore();

  if (columns.length === 0) {
    return null;
  }

  // 텍스트 필드로 사용 중인 컬럼들
  const textFieldColumns = textFields.map((f) => f.column);

  // 선택 가능한 컬럼 (텍스트 필드에 추가 가능)
  const availableForText = columns.filter((col) => !textFieldColumns.includes(col));

  return (
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

          {/* 컬럼 추가 드롭다운 */}
          {availableForText.length > 0 && (
            <div className="relative group">
              <button className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-md text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Plus size={14} />
                컬럼 추가
              </button>
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden hidden group-hover:block">
                {availableForText.map((col) => (
                  <button
                    key={col}
                    onClick={() => addTextField(col)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400">
          선택한 컬럼이 명찰에 표시됩니다
        </p>
      </div>

      {/* 템플릿 매칭 컬럼 설정 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Layers size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-600">템플릿 구분 컬럼</span>
        </div>
        <div className="space-y-1">
          {/* 없음 옵션 */}
          <label
            onClick={() => setTemplateColumn(null)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                !templateColumn
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300'
              }`}
            >
              {!templateColumn && <Check size={10} className="text-white" />}
            </div>
            <span className="text-sm text-slate-500 italic">사용 안함</span>
          </label>

          {/* 컬럼 옵션 */}
          {columns.map((col) => (
            <label
              key={col}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <input
                type="radio"
                name="templateColumn"
                checked={templateColumn === col}
                onChange={() => setTemplateColumn(col)}
                className="hidden"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  templateColumn === col
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}
              >
                {templateColumn === col && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-slate-700">{col}</span>
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400">
          값에 따라 다른 템플릿을 적용합니다
        </p>
      </div>
    </div>
  );
}
