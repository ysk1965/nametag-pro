'use client';

import { useCallback, useState, useEffect } from 'react';
import { Layers, ArrowRight, ArrowLeft, Upload, X, Trash2, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';
import type { Template } from '@/types';

interface RoleDesignGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 'upload' | 'mapping';
}

export function RoleDesignGuideModal({ isOpen, onClose, initialStep = 'upload' }: RoleDesignGuideModalProps) {
  const {
    templates,
    addTemplates,
    removeTemplate,
    columns,
    persons,
    templateColumn,
    setTemplateColumn,
    setTemplateMode,
    updateRoleMapping,
    roleMappings,
  } = useEditorStore();

  // 현재 단계: 'upload' | 'mapping'
  const [step, setStep] = useState<'upload' | 'mapping'>('upload');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(templateColumn);
  const [localMappings, setLocalMappings] = useState<Record<string, string>>({});

  // 커스텀 템플릿만 필터링
  const customTemplates = templates.filter(t => t.id !== 'default-template');

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setSelectedColumn(templateColumn);
      setLocalMappings({ ...roleMappings });
    }
  }, [isOpen, templateColumn, roleMappings, initialStep]);

  // 컬럼 선택 시 역할 목록 계산
  const getRolesForColumn = (column: string | null) => {
    if (!column) return [];
    const roleMap = new Map<string, number>();
    persons.forEach((p) => {
      const value = p.data[column];
      if (value) {
        roleMap.set(value, (roleMap.get(value) || 0) + 1);
      }
    });
    return Array.from(roleMap.entries()).map(([role, count]) => ({ role, count }));
  };

  const currentRoles = getRolesForColumn(selectedColumn);

  const processImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
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
  }, [addTemplates]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        processImageFile(file);
      });
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
  });

  const handleRemoveTemplate = (id: string) => {
    removeTemplate(id);
  };

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
    setLocalMappings({}); // 컬럼 변경 시 매핑 초기화
  };

  const handleMappingChange = (role: string, templateId: string) => {
    setLocalMappings((prev) => ({ ...prev, [role]: templateId }));
  };

  // 완료 버튼 클릭
  const handleComplete = () => {
    // 이미지가 2개 이상이고 명단이 있으면 매핑 단계로
    if (customTemplates.length >= 2 && persons.length > 0 && step === 'upload') {
      setStep('mapping');
      return;
    }

    // 매핑 단계에서 완료 시 저장
    if (step === 'mapping' && selectedColumn) {
      setTemplateColumn(selectedColumn);
      setTemplateMode('multi');
      Object.entries(localMappings).forEach(([role, templateId]) => {
        updateRoleMapping(role, templateId);
      });
    }

    onClose();
  };

  // 뒤로가기
  const handleBack = () => {
    setStep('upload');
  };

  // 저장 가능 여부 (매핑 단계)
  const canSaveMapping = selectedColumn && currentRoles.length > 0 &&
    currentRoles.every((r) => localMappings[r.role]);

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
            className={`relative bg-white rounded-2xl shadow-2xl w-full m-4 overflow-hidden max-h-[90vh] flex flex-col ${
              step === 'mapping' ? 'max-w-2xl' : 'max-w-lg'
            }`}
          >
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4 text-center bg-gradient-to-b from-indigo-50 to-white shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
              {step === 'mapping' && (
                <button
                  onClick={handleBack}
                  className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="text-slate-400" />
                </button>
              )}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-100 flex items-center justify-center"
              >
                <Layers size={32} className="text-indigo-600" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-slate-800 mb-2"
              >
                {step === 'upload' ? '역할별 디자인을 설정할 수 있어요' : '역할별 디자인 매핑'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-slate-500"
              >
                {step === 'upload'
                  ? '직분이나 소속에 따라 다른 디자인을 적용해보세요'
                  : '각 역할에 적용할 디자인을 선택하세요'}
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {step === 'upload' ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* 시각적 예시 영역 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-4">
                        {/* 왼쪽: 명단 테이블 */}
                        <div className="flex flex-col items-center">
                          <p className="text-[10px] font-medium text-slate-400 mb-2">명단 예시</p>
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px] min-w-[120px]">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="w-14 px-2 py-1.5 font-bold text-slate-500 text-center">이름</th>
                                  <th className="w-12 px-2 py-1.5 font-bold text-blue-600 bg-blue-50 text-center">직책 ←</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-slate-100">
                                  <td className="px-2 py-1.5 text-slate-600 text-center">홍길동</td>
                                  <td className="px-2 py-1.5 text-amber-600 bg-amber-50 text-center">팀장</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                  <td className="px-2 py-1.5 text-slate-600 text-center">김철수</td>
                                  <td className="px-2 py-1.5 text-blue-600 bg-blue-50 text-center">팀원</td>
                                </tr>
                                <tr>
                                  <td className="px-2 py-1.5 text-slate-600 text-center">이영희</td>
                                  <td className="px-2 py-1.5 text-blue-600 bg-blue-50 text-center">팀원</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 화살표 */}
                        <div className="text-slate-300 text-lg">→</div>

                        {/* 오른쪽: 결과 명찰 */}
                        <div className="flex flex-col items-center">
                          <p className="text-[10px] font-medium text-slate-400 mb-2">결과</p>
                          <div className="flex flex-col gap-1.5 items-start">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-7 rounded border border-slate-200 bg-white overflow-hidden shadow-sm">
                                <div className="h-2" style={{ backgroundColor: '#f59e0b' }} />
                                <div className="flex items-center justify-center h-5">
                                  <span className="text-[7px] font-bold text-slate-600">홍길동</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-amber-600">팀장</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-7 rounded border border-slate-200 bg-white overflow-hidden shadow-sm">
                                <div className="h-2 bg-blue-500" />
                                <div className="flex items-center justify-center h-5">
                                  <span className="text-[7px] font-bold text-slate-600">김철수</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-blue-600">팀원</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-7 rounded border border-slate-200 bg-white overflow-hidden shadow-sm">
                                <div className="h-2 bg-blue-500" />
                                <div className="flex items-center justify-center h-5">
                                  <span className="text-[7px] font-bold text-slate-600">이영희</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-blue-600">팀원</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 업로드된 이미지 목록 */}
                    {customTemplates.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 mb-2">
                          업로드된 디자인 ({customTemplates.length}개)
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {customTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="relative group aspect-[5/3] rounded-lg border border-slate-200 overflow-hidden bg-slate-50"
                            >
                              <img
                                src={template.dataUrl || template.imageUrl}
                                alt={template.fileName}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleRemoveTemplate(template.id)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                                <p className="text-[9px] text-white truncate">{template.fileName}</p>
                              </div>
                            </div>
                          ))}

                          {/* 추가 업로드 영역 */}
                          <div
                            {...getRootProps()}
                            className={`aspect-[5/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                              isDragActive
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                            }`}
                          >
                            <input {...getInputProps()} />
                            <Plus size={20} className="text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-400">추가</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 이미지가 없을 때 업로드 영역 */}
                    {customTemplates.length === 0 && (
                      <div className="mb-4">
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                            isDragActive
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                          <p className="text-sm text-slate-600 font-medium mb-1">
                            {isDragActive ? '여기에 놓으세요' : '디자인 이미지 업로드'}
                          </p>
                          <p className="text-xs text-slate-400">
                            JPG, PNG (여러 개 선택 가능)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 설명 영역 */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                      <ul className="space-y-2 text-xs text-indigo-700">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          역할(직분, 소속 등)에 따라 다른 디자인 이미지를 지정할 수 있어요
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          이미지를 여러 개 업로드한 후 역할별로 매칭하면 돼요
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          나중에 왼쪽 패널에서도 추가할 수 있어요
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mapping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    {/* Step 1: 구분 컬럼 선택 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                        <span className="text-sm font-bold text-slate-700">구분 컬럼 선택</span>
                      </div>
                      {columns.length === 0 ? (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
                          먼저 명단을 업로드해주세요
                        </p>
                      ) : (
                        <select
                          value={selectedColumn || ''}
                          onChange={(e) => handleColumnSelect(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">컬럼을 선택하세요</option>
                          {columns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Step 2: 역할별 템플릿 매핑 */}
                    {selectedColumn && currentRoles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                          <span className="text-sm font-bold text-slate-700">역할별 디자인 지정</span>
                        </div>
                        <div className="space-y-2">
                          {currentRoles.map(({ role, count }) => (
                            <div
                              key={role}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                            >
                              {/* 왼쪽: 역할명 */}
                              <div className="w-20 shrink-0">
                                <span className="text-sm font-bold text-slate-700 block truncate">{role}</span>
                                <span className="text-xs text-slate-400">({count}명)</span>
                              </div>

                              {/* 오른쪽: 템플릿 선택 */}
                              <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
                                {customTemplates.map((t) => {
                                  const isSelected = localMappings[role] === t.id;
                                  return (
                                    <button
                                      key={t.id}
                                      onClick={() => handleMappingChange(role, t.id)}
                                      className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                        isSelected
                                          ? 'border-indigo-500 ring-2 ring-indigo-200'
                                          : 'border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div
                                        className="w-16 aspect-[4/3] bg-slate-100"
                                        style={{
                                          backgroundImage: `url(${t.dataUrl || t.imageUrl})`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                        }}
                                      />
                                      {isSelected && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                          <Check size={10} className="text-white" />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 shrink-0">
              {step === 'upload' ? (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center gap-2 transition-all"
                >
                  {customTemplates.length >= 2 && persons.length > 0 ? '다음' : '완료'}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // 매핑 없이 완료
                      onClose();
                    }}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    건너뛰기
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={!canSaveMapping}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      canSaveMapping
                        ? 'text-white bg-indigo-500 hover:bg-indigo-600'
                        : 'text-slate-400 bg-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <Check size={18} />
                    저장
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
