'use client';

import { Trash2, Check } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

interface TemplateListProps {
  showDefaultTemplate?: boolean;
}

export function TemplateList({ showDefaultTemplate = true }: TemplateListProps) {
  const { templates, selectedTemplateId, removeTemplate, selectTemplate } = useEditorStore();

  // 표시할 템플릿 필터링
  const displayTemplates = showDefaultTemplate
    ? templates
    : templates.filter(t => t.id !== 'default-template');

  if (displayTemplates.length === 0) return null;

  return (
    <>
      {displayTemplates.map((template) => {
        const isDefault = template.id === 'default-template';
        const isSelected = template.id === selectedTemplateId;
        const canDelete = !isDefault;

        return (
          <div
            key={template.id}
            onClick={() => selectTemplate(template.id)}
            className={`group relative border-2 rounded-lg overflow-hidden h-24 cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <img
              src={template.dataUrl || template.imageUrl}
              className={`w-full h-full object-cover ${isSelected ? 'opacity-70' : 'opacity-50'}`}
              alt={template.fileName}
            />
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <span className={`text-xs font-medium truncate px-2 py-1 rounded shadow-sm max-w-full ${
                isSelected ? 'bg-blue-500 text-white' : 'bg-white/90'
              }`}>
                {template.fileName}
              </span>
            </div>
            {/* 선택 표시 */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
            {/* 기본 뱃지 */}
            {isDefault && (
              <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-slate-600 text-white px-1.5 py-0.5 rounded">
                기본
              </span>
            )}
            {/* 삭제 버튼 */}
            {canDelete && !isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTemplate(template.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
