'use client';

import { useEditorStore } from '@/stores/editor-store';
import { ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function RoleMapping() {
  const { templates, roleCounts, roleMappings, updateRoleMapping } = useEditorStore();

  // 템플릿이 1개일 때 자동 매핑
  useEffect(() => {
    if (templates.length === 1 && roleCounts.length > 0) {
      roleCounts.forEach((rc) => {
        if (!roleMappings[rc.role]) {
          updateRoleMapping(rc.role, templates[0].id);
        }
      });
    }
  }, [templates, roleCounts, roleMappings, updateRoleMapping]);

  if (roleCounts.length === 0) {
    return null;
  }

  // 역할이 없는 인원 수 계산
  const { persons, templateColumn } = useEditorStore.getState();
  const noRoleCount = templateColumn
    ? persons.filter((p) => !p.data[templateColumn]).length
    : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        {/* 헤더 */}
        <div className="grid grid-cols-[1fr,1.5fr,auto] gap-2 px-3 py-2 bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-200">
          <span>역할</span>
          <span>템플릿</span>
          <span className="text-right w-12">인원</span>
        </div>

        {/* 역할 목록 */}
        <div className="divide-y divide-slate-100">
          {roleCounts.map((rc) => (
            <RoleMappingRow
              key={rc.role}
              role={rc.role}
              count={rc.count}
              templates={templates}
              selectedTemplateId={roleMappings[rc.role] || null}
              onSelect={(templateId) => updateRoleMapping(rc.role, templateId)}
            />
          ))}

          {/* 역할 없는 인원 */}
          {noRoleCount > 0 && (
            <RoleMappingRow
              role="(역할 없음)"
              count={noRoleCount}
              templates={templates}
              selectedTemplateId={roleMappings['__no_role__'] || null}
              onSelect={(templateId) => updateRoleMapping('__no_role__', templateId)}
              isNoRole
            />
          )}
        </div>
      </div>

      {/* 안내 메시지 */}
      {Object.keys(roleMappings).length < roleCounts.length + (noRoleCount > 0 ? 1 : 0) && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
          모든 역할에 템플릿을 지정해주세요
        </p>
      )}
    </div>
  );
}

interface RoleMappingRowProps {
  role: string;
  count: number;
  templates: Array<{ id: string; fileName: string; dataUrl?: string; thumbnailUrl?: string; imageUrl: string }>;
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
  isNoRole?: boolean;
}

function RoleMappingRow({
  role,
  count,
  templates,
  selectedTemplateId,
  onSelect,
  isNoRole = false,
}: RoleMappingRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // 드롭다운 위치 계산
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="grid grid-cols-[1fr,1.5fr,auto] gap-2 px-3 py-2.5 items-center">
      {/* 역할명 */}
      <span className={`text-sm truncate ${isNoRole ? 'text-slate-400 italic' : 'text-slate-700'}`}>
        {role}
      </span>

      {/* 템플릿 선택 드롭다운 */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm text-left
            transition-colors
            ${selectedTemplate
              ? 'border-slate-200 bg-white hover:border-slate-300'
              : 'border-amber-300 bg-amber-50 hover:border-amber-400'
            }
          `}
        >
          {selectedTemplate ? (
            <>
              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                <img
                  src={selectedTemplate.dataUrl || selectedTemplate.thumbnailUrl || selectedTemplate.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="truncate flex-1 text-slate-700">
                {selectedTemplate.fileName.replace(/\.[^/.]+$/, '')}
              </span>
            </>
          ) : (
            <>
              <ImageIcon size={16} className="text-slate-400" />
              <span className="text-slate-400 flex-1">선택</span>
            </>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 드롭다운 메뉴 (Portal로 body에 렌더링) */}
        {isOpen && (
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden"
          >
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-2.5 py-2 text-sm text-left
                  hover:bg-slate-50 transition-colors
                  ${template.id === selectedTemplateId ? 'bg-blue-50' : ''}
                `}
              >
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                  <img
                    src={template.dataUrl || template.thumbnailUrl || template.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="truncate flex-1 text-slate-700">
                  {template.fileName.replace(/\.[^/.]+$/, '')}
                </span>
                {template.id === selectedTemplateId && (
                  <Check size={14} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 인원수 */}
      <span className="text-sm text-slate-500 text-right w-12 tabular-nums">
        {count}명
      </span>
    </div>
  );
}
