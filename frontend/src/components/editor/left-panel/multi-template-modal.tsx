'use client';

import { useState, useEffect } from 'react';
import { X, Layers, Check, AlertCircle, Palette } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

// 기본 명찰용 색상 프리셋
const COLOR_PRESETS = [
  { color: '#3b82f6', name: '블루' },
  { color: '#10b981', name: '그린' },
  { color: '#f59e0b', name: '옐로우' },
  { color: '#ef4444', name: '레드' },
  { color: '#8b5cf6', name: '퍼플' },
  { color: '#ec4899', name: '핑크' },
  { color: '#6366f1', name: '인디고' },
  { color: '#f97316', name: '오렌지' },
  { color: '#64748b', name: '슬레이트' },
];

interface MultiTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function MultiTemplateModal({ isOpen, onClose, onSave }: MultiTemplateModalProps) {
  const {
    columns,
    templates,
    templateColumn,
    roleCounts,
    roleMappings,
    roleColors,
    designMode,
    setTemplateColumn,
    setTemplateMode,
    updateRoleMapping,
    updateRoleColor,
  } = useEditorStore();

  const [selectedColumn, setSelectedColumn] = useState<string | null>(templateColumn);
  const [localMappings, setLocalMappings] = useState<Record<string, string>>({});
  const [localColors, setLocalColors] = useState<Record<string, string>>({});

  // 모달 열릴 때 현재 상태로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedColumn(templateColumn);
      setLocalMappings({ ...roleMappings });
      setLocalColors({ ...roleColors });
    }
  }, [isOpen, templateColumn, roleMappings, roleColors]);

  // 컬럼 선택 시 역할 목록 계산
  const getRolesForColumn = (column: string | null) => {
    if (!column) return [];
    const { persons } = useEditorStore.getState();
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

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
    setLocalMappings({}); // 컬럼 변경 시 매핑 초기화
    setLocalColors({});   // 컬럼 변경 시 색상 초기화
  };

  const handleMappingChange = (role: string, templateId: string) => {
    setLocalMappings((prev) => ({ ...prev, [role]: templateId }));
  };

  const handleColorChange = (role: string, color: string) => {
    setLocalColors((prev) => ({ ...prev, [role]: color }));
  };

  const handleSave = () => {
    if (selectedColumn) {
      setTemplateColumn(selectedColumn);
      setTemplateMode('multi');  // 역할별 설정 시 멀티 모드로 변경
      if (designMode === 'default') {
        // 기본 명찰 모드: 색상 저장
        Object.entries(localColors).forEach(([role, color]) => {
          updateRoleColor(role, color);
        });
      } else {
        // 커스텀 모드: 템플릿 매핑 저장
        Object.entries(localMappings).forEach(([role, templateId]) => {
          updateRoleMapping(role, templateId);
        });
      }
    }
    onSave();
  };

  // 저장 가능 여부
  const canSave = selectedColumn && currentRoles.length > 0 && (
    designMode === 'default'
      ? currentRoles.every((r) => localColors[r.role])
      : currentRoles.every((r) => localMappings[r.role])
  );

  if (!isOpen) return null;

  const isDefaultMode = designMode === 'default';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDefaultMode ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              {isDefaultMode ? (
                <Palette size={18} className="text-blue-600" />
              ) : (
                <Layers size={18} className="text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                {isDefaultMode ? '역할별 색상 설정' : '역할별 디자인 설정'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isDefaultMode ? '역할별로 다른 색상 적용' : '역할별로 다른 디자인 적용'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 시각적 예시 */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
            <div className="flex gap-4 items-center">
              {/* 왼쪽: 명단 테이블 예시 */}
              <div className="flex-1 flex flex-col items-center">
                <p className="text-[10px] font-medium text-slate-400 mb-2">명단 예시</p>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px] min-w-[140px]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="w-16 px-2 py-1.5 font-bold text-slate-500 text-center">이름</th>
                        <th className="w-14 px-2 py-1.5 font-bold text-blue-600 bg-blue-50 text-center">직책 ←</th>
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
                <p className="text-[9px] text-blue-500 mt-1.5 text-center">구분 컬럼 = "직책"</p>
              </div>

              {/* 화살표 */}
              <div className="text-slate-300 text-lg">→</div>

              {/* 오른쪽: 결과 명찰 */}
              <div className="flex-1 flex flex-col items-center">
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

          {/* Step 1: 구분 컬럼 선택 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</span>
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
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Step 2: 역할별 색상 또는 템플릿 매핑 */}
          {selectedColumn && currentRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-sm font-bold text-slate-700">
                  {isDefaultMode ? '역할별 색상 지정' : '역할별 디자인 지정'}
                </span>
              </div>
              <div className="space-y-2">
                {currentRoles.map(({ role, count }) => {
                  if (isDefaultMode) {
                    // 기본 명찰 모드: 색상 선택
                    const selectedColor = localColors[role];
                    return (
                      <div
                        key={role}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        {/* 왼쪽: 역할명 */}
                        <div className="w-24 shrink-0">
                          <span className="text-sm font-bold text-slate-700 block">{role}</span>
                          <span className="text-xs text-slate-400">({count}명)</span>
                        </div>

                        {/* 오른쪽: 색상 선택 */}
                        <div className="flex-1 flex gap-1.5">
                          {COLOR_PRESETS.map(({ color, name }) => {
                            const isSelected = selectedColor === color;
                            return (
                              <button
                                key={color}
                                onClick={() => handleColorChange(role, color)}
                                title={name}
                                className={`relative w-6 h-6 rounded-full transition-all shrink-0 ${
                                  isSelected
                                    ? 'ring-2 ring-offset-1 ring-blue-500 scale-110'
                                    : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: color }}
                              >
                                {isSelected && (
                                  <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } else {
                    // 커스텀 모드: 템플릿 선택
                    return (
                      <div
                        key={role}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        {/* 왼쪽: 역할명 */}
                        <div className="w-24 shrink-0">
                          <span className="text-sm font-bold text-slate-700 block">{role}</span>
                          <span className="text-xs text-slate-400">({count}명)</span>
                        </div>

                        {/* 오른쪽: 템플릿 선택 */}
                        <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
                          {templates.filter(t => t.id !== 'default-template').map((t) => {
                            const isSelected = localMappings[role] === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => handleMappingChange(role, t.id)}
                                className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                  isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div
                                  className="w-20 aspect-[4/3] bg-slate-100"
                                  style={{
                                    backgroundImage: `url(${t.dataUrl || t.imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check size={10} className="text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* 디자인 없음 경고 (커스텀 모드만) */}
          {!isDefaultMode && templates.filter(t => t.id !== 'default-template').length < 2 && (
            <div className="bg-amber-50 rounded-lg p-3 flex gap-3">
              <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-medium">디자인을 더 추가해주세요</p>
                <p className="text-amber-600">
                  역할별 디자인을 사용하려면 2개 이상의 디자인이 필요합니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 border-t bg-slate-50 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
              canSave
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check size={16} />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
