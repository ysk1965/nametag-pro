'use client';

import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Template } from '@/types';

export function TemplateUpload() {
  const { addTemplates } = useEditorStore();

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const img = new Image();
          img.onload = () => {
            const newTemplate: Template = {
              id: generateId(),
              fileName: file.name,
              imageUrl: dataUrl,
              dataUrl: dataUrl,
              width: img.width,
              height: img.height,
              role: null,
            };
            addTemplates([newTemplate]);
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });

      // Reset input
      e.target.value = '';
    },
    [addTemplates]
  );

  return (
    <label className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleUpload}
      />
      <div className="p-2 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
        <Upload size={20} className="text-slate-500 group-hover:text-blue-600" />
      </div>
      <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
        Add Design
      </span>
      <span className="text-[10px] text-slate-400">JPG, PNG (max 10MB)</span>
    </label>
  );
}
