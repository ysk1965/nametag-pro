'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useEditorStore } from '@/stores/editor-store';
import { Type, Upload, X, Check, ChevronDown, Bold } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  loadFontFile,
  registerFont,
  unregisterFont,
  reloadCustomFonts,
  isSupportedFontFile,
} from '@/lib/font-loader';

const FONTS = [
  // 한글 폰트
  { value: 'Pretendard', label: '프리텐다드' },
  { value: 'Noto Sans KR', label: '노토 산스' },
  { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Nanum Myeongjo', label: '나눔명조' },
  // 영문 폰트
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Arial', label: 'Arial' },
];


export function RightPanel() {
  const t = useTranslations('editor.rightPanel');
  const {
    columns,
    textFields,
    selectedTextFieldId,
    textConfig,
    customFonts,
    exportConfig,
    setSelectedTextField,
    updateTextFieldStyle,
    updateTextFieldPosition,
    setTextStyle,
    addTextField,
    removeTextField,
    addCustomFont,
    removeCustomFont,
    setFontLoaded,
  } = useEditorStore();

  const fontInputRef = useRef<HTMLInputElement>(null);

  // 페이지 로드 시 저장된 커스텀 폰트 재등록
  useEffect(() => {
    if (customFonts.length > 0) {
      reloadCustomFonts(customFonts).then((failedIds) => {
        // 로드 실패한 폰트 자동 제거
        failedIds.forEach((id) => {
          removeCustomFont(id);
        });

        // 성공한 폰트 로드 완료 상태 업데이트
        customFonts.forEach((font) => {
          if (!font.loaded && !failedIds.includes(font.id)) {
            setFontLoaded(font.id, true);
          }
        });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 폰트 업로드 핸들러
  const handleFontUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isSupportedFontFile(file)) {
        alert(t('unsupportedFont'));
        return;
      }

      try {
        const customFont = await loadFontFile(file);
        await registerFont(customFont);
        addCustomFont({ ...customFont, loaded: true });
      } catch (error) {
        alert(error instanceof Error ? error.message : t('fontLoadFailed'));
      }

      // 입력 초기화
      e.target.value = '';
    },
    [addCustomFont]
  );

  // 폰트 삭제 핸들러
  const handleRemoveFont = useCallback(
    (fontId: string) => {
      const font = customFonts.find((f) => f.id === fontId);
      if (font) {
        unregisterFont(font);
        removeCustomFont(fontId);
      }
    },
    [customFonts, removeCustomFont]
  );

  // 컬럼 토글 핸들러
  const handleToggleColumn = (column: string) => {
    const existingField = textFields.find(f => f.column === column);
    if (existingField) {
      // 이미 있으면 제거 (최소 1개는 유지)
      if (textFields.length > 1) {
        removeTextField(existingField.id);
      }
    } else {
      // 없으면 추가
      addTextField(column);
    }
  };

  // 스타일 업데이트 핸들러
  const handleStyleChange = (fieldId: string, style: Partial<typeof textConfig.style>) => {
    updateTextFieldStyle(fieldId, style);
    setTextStyle(style);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Text Field Selection with Expandable Style */}
      {columns.length > 0 && (
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
            {t('textFields')}
          </label>
          <div className="space-y-2">
            {columns.map((column) => {
              const field = textFields.find(f => f.column === column);
              const isActive = !!field;
              const isSelected = field?.id === selectedTextFieldId;

              return (
                <div key={column} className="space-y-0">
                  {/* 필드 헤더 */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400'
                        : isActive
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    {/* 체크박스 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleColumn(column);
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isActive && <Check size={12} className="text-white" />}
                    </button>

                    {/* 컬럼명 (클릭하면 선택/토글) */}
                    <button
                      onClick={() => {
                        if (field) {
                          // 이미 선택된 상태면 선택 해제, 아니면 선택
                          setSelectedTextField(isSelected ? null : field.id);
                        } else {
                          // 체크 안 된 컬럼 클릭 시 추가하고 선택
                          addTextField(column);
                        }
                      }}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <Type size={14} className={isActive ? 'text-blue-500' : 'text-slate-300'} />
                      <span className={`text-sm font-medium truncate ${
                        isActive ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {column}
                      </span>
                    </button>

                    {/* 폰트 크기 & 화살표 */}
                    {field && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">{field.style.fontSize}px</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform ${
                            isSelected ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* 펼쳐지는 스타일 패널 */}
                  <AnimatePresence>
                    {isSelected && field && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 pb-3 px-3 ml-7 border-l-2 border-blue-200 space-y-3">
                          {/* 위치 - 한 줄로 */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-6">{t('position')}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">X</span>
                              <input
                                type="number"
                                step="0.1"
                                value={Math.round((field.position.x / 100) * exportConfig.fixedWidth * 10) / 10}
                                onChange={(e) => {
                                  const mmValue = parseFloat(e.target.value) || 0;
                                  const percentValue = (mmValue / exportConfig.fixedWidth) * 100;
                                  updateTextFieldPosition(
                                    field.id,
                                    Math.max(0, Math.min(100, percentValue)),
                                    field.position.y
                                  );
                                }}
                                className="w-14 border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700 text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Y</span>
                              <input
                                type="number"
                                step="0.1"
                                value={Math.round((exportConfig.fixedHeight - (field.position.y / 100) * exportConfig.fixedHeight) * 10) / 10}
                                onChange={(e) => {
                                  const mmValue = parseFloat(e.target.value) || 0;
                                  // Y값 반전: 사용자 입력값이 커지면 위로(position.y는 작아짐)
                                  const invertedMm = exportConfig.fixedHeight - mmValue;
                                  const percentValue = (invertedMm / exportConfig.fixedHeight) * 100;
                                  updateTextFieldPosition(
                                    field.id,
                                    field.position.x,
                                    Math.max(0, Math.min(100, percentValue))
                                  );
                                }}
                                className="w-14 border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700 text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <span className="text-[10px] text-slate-300">mm</span>
                          </div>

                          {/* 폰트 - 한 줄로 */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-6">{t('font')}</span>
                            <select
                              value={field.style.fontFamily}
                              onChange={(e) => handleStyleChange(field.id, { fontFamily: e.target.value })}
                              className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            >
                              <optgroup label={t('defaultFonts')}>
                                {FONTS.map((font) => (
                                  <option key={font.value} value={font.value}>
                                    {font.label}
                                  </option>
                                ))}
                              </optgroup>
                              {customFonts.length > 0 && (
                                <optgroup label={t('uploadedFonts')}>
                                  {customFonts.map((font) => (
                                    <option key={font.id} value={font.fontFamily}>
                                      {font.name}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                            <button
                              onClick={() => fontInputRef.current?.click()}
                              className="w-7 h-7 border border-dashed border-slate-300 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                              title={t('uploadFont')}
                            >
                              <Upload size={12} className="text-slate-500" />
                            </button>
                          </div>

                          {/* 크기, 굵기, 색상 - 한 줄로 */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-6">{t('size')}</span>
                            {/* 크기 슬라이더 */}
                            <div className="flex-1">
                              <input
                                type="range"
                                min="12"
                                max="120"
                                step="1"
                                value={field.style.fontSize}
                                onChange={(e) => handleStyleChange(field.id, { fontSize: parseInt(e.target.value) })}
                                className="w-full accent-blue-600 h-1.5"
                              />
                            </div>

                            {/* 크기 숫자 표시 */}
                            <span className="text-[10px] text-slate-500 w-8 text-right">
                              {field.style.fontSize}px
                            </span>

                            {/* 굵기 토글 */}
                            <button
                              onClick={() => handleStyleChange(field.id, {
                                fontWeight: field.style.fontWeight === 700 ? 400 : 700
                              })}
                              className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${
                                field.style.fontWeight === 700
                                  ? 'bg-blue-500 border-blue-500 text-white'
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                              }`}
                              title={t('bold')}
                            >
                              <Bold size={14} />
                            </button>

                            {/* 색상 피커 */}
                            <div className="relative w-7 h-7">
                              <input
                                type="color"
                                value={field.style.color}
                                onChange={(e) => handleStyleChange(field.id, { color: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div
                                className="w-full h-full rounded border border-slate-200"
                                style={{ backgroundColor: field.style.color }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-slate-400">
            {t('fieldHint')}
          </p>
        </section>
      )}

      {/* 업로드한 폰트 목록 */}
      {customFonts.length > 0 && (
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
            {t('uploadedFonts')}
          </label>
          <div className="space-y-1">
            {customFonts.map((font) => (
              <div
                key={font.id}
                className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm"
              >
                <span
                  className="truncate flex-1"
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.name}
                </span>
                <button
                  onClick={() => handleRemoveFont(font.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                  title={t('deleteFont')}
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hidden font input */}
      <input
        ref={fontInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
        className="hidden"
      />
    </div>
  );
}
