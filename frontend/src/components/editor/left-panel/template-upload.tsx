'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Template } from '@/types';

export function TemplateUpload() {
  const { addTemplates, templates, setExportConfig } = useEditorStore();
  const t = useTranslations('editor.templateUpload');

  const processFiles = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(t('fileTooLarge', { name: file.name }));
          return;
        }

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

            // 첫 번째 커스텀 템플릿 업로드 시 명찰 크기 자동 설정
            const customTemplates = templates.filter(t => t.id !== 'default-template');
            if (customTemplates.length === 0) {
              // 픽셀을 mm로 변환 (300 DPI 기준)
              const DPI = 300;
              const pxToMm = (px: number) => Math.round((px / DPI) * 25.4);

              let widthMm = pxToMm(img.width);
              let heightMm = pxToMm(img.height);

              // 너무 크거나 작으면 적절한 크기로 스케일
              const maxSize = 150; // 최대 150mm
              const minSize = 30;  // 최소 30mm

              if (widthMm > maxSize || heightMm > maxSize) {
                const scale = maxSize / Math.max(widthMm, heightMm);
                widthMm = Math.round(widthMm * scale);
                heightMm = Math.round(heightMm * scale);
              } else if (widthMm < minSize && heightMm < minSize) {
                const scale = minSize / Math.min(widthMm, heightMm);
                widthMm = Math.round(widthMm * scale);
                heightMm = Math.round(heightMm * scale);
              }

              setExportConfig({
                fixedWidth: widthMm,
                fixedHeight: heightMm,
                sizeMode: 'fixed',
              });
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    },
    [addTemplates, templates, setExportConfig]
  );

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      processFiles(Array.from(files));
      e.target.value = '';
    },
    [processFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
    noClick: true,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
        <input
          {...getInputProps()}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={handleUpload}
        />
        <div className={`p-2 rounded-full transition-colors ${
          isDragActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'
        }`}>
          <Upload size={20} className={isDragActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'} />
        </div>
        <span className={`text-xs font-bold ${isDragActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`}>
          {isDragActive ? t('dropHere') : t('addDesign')}
        </span>
        <span className="text-[10px] text-slate-400">{t('formats')}</span>
      </label>
    </div>
  );
}
