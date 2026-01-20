'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { TemplateUpload } from './template-upload';
import { TemplateList } from './template-list';
import { DataUpload } from './data-upload';
import { DataPreview } from './data-preview';
import { ColumnConfig } from './column-config';
import { RoleMapping } from './role-mapping';
import { useEditorStore } from '@/stores/editor-store';

export function LeftPanel() {
  const {
    templates,
    persons,
    columns,
    templateMode,
    templateColumn,
    roleCounts,
    setTemplateMode,
    setTemplateColumn,
  } = useEditorStore();

  // 템플릿 구분 컬럼 드롭다운 상태
  const [isTemplateColumnOpen, setIsTemplateColumnOpen] = useState(false);
  const templateColumnButtonRef = useRef<HTMLButtonElement>(null);
  const templateColumnDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // 드롭다운 위치 계산
  useEffect(() => {
    if (isTemplateColumnOpen && templateColumnButtonRef.current) {
      const rect = templateColumnButtonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isTemplateColumnOpen]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        templateColumnButtonRef.current && !templateColumnButtonRef.current.contains(event.target as Node) &&
        templateColumnDropdownRef.current && !templateColumnDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateColumnOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 컬럼 설정 섹션 표시 조건: 명단이 있고 컬럼이 있을 때
  const showColumnConfig = persons.length > 0 && columns.length > 0;

  // 역할 매칭 섹션 표시 조건: 멀티 템플릿 모드이고, 템플릿 구분 컬럼이 선택되고, 역할이 있을 때
  const showRoleMapping = templateMode === 'multi' && templateColumn && templates.length > 0 && roleCounts.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8">
      {/* Guest List Section - 먼저 명단 업로드 */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          1. 명단
        </label>
        {persons.length > 0 ? <DataPreview /> : <DataUpload />}
      </section>

      {/* Column Config Section */}
      {showColumnConfig && (
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
            2. 컬럼 설정
          </label>
          <ColumnConfig />
        </section>
      )}

      {/* Templates Section */}
      <section>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
          {showColumnConfig ? '3. 템플릿' : '2. 템플릿'}
        </label>

        {/* 싱글/멀티 템플릿 토글 */}
        <div className="flex rounded-lg border border-slate-200 p-1 mb-3 bg-slate-50">
          <button
            onClick={() => setTemplateMode('single')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              templateMode === 'single'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            싱글 템플릿
          </button>
          <button
            onClick={() => setTemplateMode('multi')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              templateMode === 'multi'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            멀티 템플릿
          </button>
        </div>

        <div className="space-y-3">
          <TemplateList />
          <TemplateUpload />
        </div>

        {templateMode === 'single' && (
          <p className="mt-2 text-[10px] text-slate-400">
            선택한 템플릿 하나로 모든 명찰을 생성합니다
          </p>
        )}

        {/* 멀티 템플릿 모드: 템플릿 구분 컬럼 선택 */}
        {templateMode === 'multi' && columns.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              템플릿 구분 컬럼
            </label>
            <div className="relative">
              <button
                ref={templateColumnButtonRef}
                onClick={() => setIsTemplateColumnOpen(!isTemplateColumnOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors text-sm text-left"
              >
                <span className={`flex-1 truncate ${templateColumn ? 'text-slate-700' : 'text-slate-400'}`}>
                  {templateColumn || '컬럼 선택'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${isTemplateColumnOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* 드롭다운 메뉴 */}
              {isTemplateColumnOpen && (
                <div
                  ref={templateColumnDropdownRef}
                  style={dropdownStyle}
                  className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                >
                  {columns.map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setTemplateColumn(col);
                        setIsTemplateColumnOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                        templateColumn === col ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="flex-1 text-slate-700 truncate">{col}</span>
                      {templateColumn === col && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              이 컬럼의 값에 따라 다른 템플릿을 적용합니다
            </p>
          </div>
        )}

        {templateMode === 'multi' && columns.length === 0 && (
          <p className="mt-2 text-[10px] text-amber-600">
            먼저 명단을 업로드해주세요
          </p>
        )}
      </section>

      {/* Role Mapping Section - 멀티 템플릿 모드에서만 표시 */}
      {showRoleMapping && (
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
            4. 역할 매칭
          </label>
          <RoleMapping />
        </section>
      )}
    </div>
  );
}
