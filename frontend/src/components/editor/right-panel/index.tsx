'use client';

import { useEditorStore } from '@/stores/editor-store';
import { Type } from 'lucide-react';
import { LayoutPreview } from '../layout-preview';

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

const COLORS = [
  '#000000',
  '#333333',
  '#666666',
  '#FFFFFF',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
];

const LAYOUTS = [
  { value: '2x2' as const, label: '2×2 (4장)' },
  { value: '2x3' as const, label: '2×3 (6장)' },
  { value: '3x3' as const, label: '3×3 (9장)' },
  { value: '2x4' as const, label: '2×4 (8장)' },
];

export function RightPanel() {
  const {
    textFields,
    selectedTextFieldId,
    textConfig,
    exportConfig,
    setSelectedTextField,
    updateTextFieldStyle,
    updateTextFieldPosition,
    setTextStyle,
    setTextPosition,
    setExportConfig,
  } = useEditorStore();

  // 선택된 텍스트 필드 찾기
  const selectedField = textFields.find((f) => f.id === selectedTextFieldId);

  // 현재 스타일 (선택된 필드 또는 기본 textConfig)
  const currentStyle = selectedField?.style || textConfig.style;
  const currentPosition = selectedField?.position || textConfig.position;

  // 스타일 업데이트 핸들러
  const handleStyleChange = (style: Partial<typeof currentStyle>) => {
    if (selectedTextFieldId) {
      updateTextFieldStyle(selectedTextFieldId, style);
    }
    setTextStyle(style);
  };

  // 위치 업데이트 핸들러
  const handlePositionChange = (x: number, y: number) => {
    if (selectedTextFieldId) {
      updateTextFieldPosition(selectedTextFieldId, x, y);
    }
    setTextPosition(x, y);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8">
      {/* Text Field Selection */}
      {textFields.length > 0 && (
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
            텍스트 필드
          </label>
          <div className="space-y-1.5">
            {textFields.map((field, index) => (
              <button
                key={field.id}
                onClick={() => setSelectedTextField(field.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                  selectedTextFieldId === field.id
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Type size={14} className={selectedTextFieldId === field.id ? 'text-blue-500' : 'text-slate-400'} />
                <span className="flex-1 text-sm font-medium truncate">{field.column}</span>
                <span className="text-xs text-slate-400">{field.style.fontSize}px</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Text Style */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          {selectedField ? `"${selectedField.column}" 스타일` : '텍스트 스타일'}
        </label>
        <div className="space-y-6">
          {/* Font Family */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              폰트
            </label>
            <select
              value={currentStyle.fontFamily}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              크기 ({currentStyle.fontSize}px)
            </label>
            <input
              type="range"
              min="12"
              max="120"
              step="1"
              value={currentStyle.fontSize}
              onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              굵기
            </label>
            <div className="flex gap-2">
              {[
                { value: 400 as const, label: '보통' },
                { value: 700 as const, label: '굵게' },
              ].map((weight) => (
                <button
                  key={weight.value}
                  onClick={() => handleStyleChange({ fontWeight: weight.value })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                    currentStyle.fontWeight === weight.value
                      ? 'bg-blue-50 border-blue-600 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              색상
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleStyleChange({ color })}
                  className={`w-8 h-8 rounded-full border shadow-sm transition-transform ${
                    currentStyle.color === color
                      ? 'scale-125 ring-2 ring-blue-200'
                      : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    borderColor: color === '#FFFFFF' ? '#e2e8f0' : color,
                  }}
                />
              ))}
              <input
                type="color"
                value={currentStyle.color}
                onChange={(e) => handleStyleChange({ color: e.target.value })}
                className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              위치 (%)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400">
                  X: {currentPosition.x.toFixed(1)}%
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(currentPosition.x)}
                  onChange={(e) =>
                    handlePositionChange(parseFloat(e.target.value), currentPosition.y)
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">
                  Y: {currentPosition.y.toFixed(1)}%
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(currentPosition.y)}
                  onChange={(e) =>
                    handlePositionChange(currentPosition.x, parseFloat(e.target.value))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export Settings */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          출력 설정
        </label>
        <div className="space-y-6">
          {/* Paper Size */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              용지 크기
            </label>
            <div className="flex gap-2">
              {(['A4', 'Letter'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setExportConfig({ paperSize: size })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                    exportConfig.paperSize === size
                      ? 'bg-blue-50 border-blue-600 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Size Mode Toggle */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              명찰 크기 설정
            </label>
            <div className="flex gap-2">
              {([
                { value: 'auto' as const, label: '자동 (레이아웃 기반)' },
                { value: 'fixed' as const, label: '고정 크기' },
              ]).map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setExportConfig({ sizeMode: mode.value })}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-colors ${
                    exportConfig.sizeMode === mode.value
                      ? 'bg-blue-50 border-blue-600 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Size Inputs (shown only in fixed mode) */}
          {exportConfig.sizeMode === 'fixed' && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    가로 (mm)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    value={exportConfig.fixedWidth}
                    onChange={(e) => setExportConfig({ fixedWidth: parseInt(e.target.value) || 90 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    세로 (mm)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    value={exportConfig.fixedHeight}
                    onChange={(e) => setExportConfig({ fixedHeight: parseInt(e.target.value) || 55 })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
                  />
                </div>
              </div>
              {/* 일반적인 명찰 크기 프리셋 */}
              <div>
                <label className="text-[10px] text-slate-400 mb-1 block">프리셋</label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { w: 90, h: 55, label: '명함 (90×55)' },
                    { w: 86, h: 54, label: '신용카드 (86×54)' },
                    { w: 100, h: 70, label: '대형 (100×70)' },
                    { w: 75, h: 50, label: '소형 (75×50)' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setExportConfig({ fixedWidth: preset.w, fixedHeight: preset.h })}
                      className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                        exportConfig.fixedWidth === preset.w && exportConfig.fixedHeight === preset.h
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Layout Grid (shown only in auto mode) */}
          {exportConfig.sizeMode === 'auto' && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">
                레이아웃
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => setExportConfig({ layout: layout.value })}
                    className={`py-3 rounded-lg border text-sm font-bold transition-colors ${
                      exportConfig.layout === layout.value
                        ? 'bg-blue-50 border-blue-600 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Margins */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              여백 ({exportConfig.margin}mm)
            </label>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={exportConfig.margin}
              onChange={(e) => setExportConfig({ margin: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Layout Preview */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          레이아웃 미리보기
        </label>
        <LayoutPreview />
      </section>
    </div>
  );
}
