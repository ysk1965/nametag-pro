'use client';

import { useState, useCallback } from 'react';
import { Sparkles, FileImage, X, ArrowRight, Check, Upload, Palette } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Template } from '@/types';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (uploadedCount: number) => void;
}

export function TemplateSelectionModal({ isOpen, onClose, onUploadComplete }: TemplateSelectionModalProps) {
  const {
    setDesignMode,
    setTemplateMode,
    addTemplates,
    templates,
  } = useEditorStore();

  const [selectedMode, setSelectedMode] = useState<'default' | 'custom'>('custom');

  const handleModeSelect = (mode: 'default' | 'custom') => {
    setSelectedMode(mode);
  };

  const processMultipleFiles = useCallback((files: File[]) => {
    const newTemplates: Template[] = [];
    let processed = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          newTemplates.push({
            id: generateId(),
            fileName: file.name,
            imageUrl: dataUrl,
            dataUrl: dataUrl,
            width: img.width,
            height: img.height,
            role: null,
          });
          processed++;

          // 모든 파일이 처리되면 템플릿 추가
          if (processed === files.length) {
            setDesignMode('custom');
            setTemplateMode(newTemplates.length > 1 ? 'multi' : 'single');
            addTemplates(newTemplates);
            onClose();
            // 업로드 완료 콜백 호출
            onUploadComplete?.(newTemplates.length);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }, [setDesignMode, setTemplateMode, addTemplates, onClose, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processMultipleFiles(acceptedFiles);
      }
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
  });

  const handleConfirm = useCallback(() => {
    // 기본 명찰 선택 시
    if (selectedMode === 'default') {
      setDesignMode('default');
      setTemplateMode('single');
      onClose();
    }
    // 커스텀 모드는 이미지 업로드 시 바로 처리됨
  }, [selectedMode, setDesignMode, setTemplateMode, onClose]);

  const hasCustomTemplates = templates.some(t => t.id !== 'default-template');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4 text-center bg-gradient-to-b from-purple-50 to-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center"
              >
                <Palette size={32} className="text-purple-600" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-slate-800 mb-2"
              >
                명찰 디자인을 선택하세요
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-slate-500"
              >
                기본 제공 디자인을 사용하거나, 직접 만든 이미지를 업로드할 수 있어요
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* 기본 명찰 */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect('default')}
                  className={`relative border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    selectedMode === 'default'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  {selectedMode === 'default' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-xl transition-colors ${
                    selectedMode === 'default' ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <Sparkles size={28} className={selectedMode === 'default' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-bold block mb-1 ${
                      selectedMode === 'default' ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      기본 명찰
                    </span>
                    <span className="text-xs text-slate-400">빠르고 간편하게</span>
                  </div>
                </motion.button>

                {/* 내 디자인 */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeSelect('custom')}
                  className={`relative border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    selectedMode === 'custom'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50'
                  }`}
                >
                  {selectedMode === 'custom' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-xl transition-colors ${
                    selectedMode === 'custom' ? 'bg-purple-100' : 'bg-slate-100'
                  }`}>
                    <FileImage size={28} className={selectedMode === 'custom' ? 'text-purple-600' : 'text-slate-400'} />
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-bold block mb-1 ${
                      selectedMode === 'custom' ? 'text-purple-700' : 'text-slate-700'
                    }`}>
                      내 디자인
                    </span>
                    <span className="text-xs text-slate-400">이미지 업로드</span>
                  </div>
                </motion.button>
              </div>

              {/* 선택된 모드에 따른 추가 설명/액션 */}
              <AnimatePresence mode="wait">
                {selectedMode === 'default' && (
                  <motion.div
                    key="default-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4"
                  >
                    <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                      <Sparkles size={16} />
                      기본 명찰 특징
                    </h4>
                    <ul className="space-y-1.5 text-xs text-blue-700">
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        깔끔한 디자인의 명찰을 바로 사용할 수 있어요
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        역할(직분, 소속 등)에 따라 다른 색상을 지정할 수 있어요
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        이름, 소속 등 텍스트 위치와 스타일을 자유롭게 조정해요
                      </li>
                    </ul>
                  </motion.div>
                )}

                {selectedMode === 'custom' && (
                  <motion.div
                    key="custom-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 mb-4"
                  >
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <h4 className="font-bold text-purple-800 text-sm mb-2 flex items-center gap-2">
                        <FileImage size={16} />
                        내 디자인 특징
                      </h4>
                      <ul className="space-y-1.5 text-xs text-purple-700">
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          직접 만든 이미지(JPG, PNG)를 명찰 배경으로 사용해요
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          역할별로 다른 디자인 이미지를 지정할 수 있어요
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          브랜드 아이덴티티를 반영한 명찰을 만들 수 있어요
                        </li>
                      </ul>
                    </div>

                    {/* 이미지 업로드 영역 - 항상 표시 */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="py-2">
                        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600 font-medium">
                          {isDragActive ? '여기에 놓으세요' : '디자인 이미지 업로드'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          JPG, PNG (최대 10MB) · 여러 이미지 선택 가능
                        </p>
                      </div>
                    </div>

                    {/* 기존 업로드된 디자인 표시 */}
                    {hasCustomTemplates && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-xs text-green-700 font-medium flex items-center gap-1 mb-2">
                          <Check size={14} />
                          업로드된 디자인 {templates.filter(t => t.id !== 'default-template').length}개
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {templates.filter(t => t.id !== 'default-template').map((template) => (
                            <div
                              key={template.id}
                              className="w-12 h-8 rounded border border-green-200 overflow-hidden"
                              style={{
                                backgroundImage: `url(${template.dataUrl || template.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                              title={template.fileName}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 확인 버튼 */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleConfirm}
                disabled={selectedMode === 'custom' && !hasCustomTemplates}
                className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  selectedMode === 'custom' && !hasCustomTemplates
                    ? 'bg-slate-300 cursor-not-allowed'
                    : selectedMode === 'default'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                다음 단계로
                <ArrowRight size={18} />
              </motion.button>

              {/* 나중에 하기 */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                onClick={onClose}
                className="mt-3 w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                나중에 설정할게요
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
