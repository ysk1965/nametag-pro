'use client';

import { useEditorStore } from '@/stores/editor-store';
import { Check, Image as ImageIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function RoleMapping() {
  const { templates, roleCounts, roleMappings, updateRoleMapping } = useEditorStore();

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const openModal = (role: string) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRole(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    if (selectedRole) {
      updateRoleMapping(selectedRole, templateId);
    }
    closeModal();
  };

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

  const currentSelectedTemplateId = selectedRole ? roleMappings[selectedRole] : null;

  return (
    <>
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
            {roleCounts.map((rc) => {
              const selectedTemplate = templates.find((t) => t.id === roleMappings[rc.role]);
              return (
                <div key={rc.role} className="grid grid-cols-[1fr,1.5fr,auto] gap-2 px-3 py-2.5 items-center">
                  <span className="text-sm truncate text-slate-700">{rc.role}</span>
                  <button
                    onClick={() => openModal(rc.role)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm text-left transition-colors ${
                      selectedTemplate
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-amber-300 bg-amber-50 hover:border-amber-400'
                    }`}
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
                  </button>
                  <span className="text-sm text-slate-500 text-right w-12 tabular-nums">{rc.count}명</span>
                </div>
              );
            })}

            {/* 역할 없는 인원 */}
            {noRoleCount > 0 && (() => {
              const selectedTemplate = templates.find((t) => t.id === roleMappings['__no_role__']);
              return (
                <div className="grid grid-cols-[1fr,1.5fr,auto] gap-2 px-3 py-2.5 items-center">
                  <span className="text-sm truncate text-slate-400 italic">(역할 없음)</span>
                  <button
                    onClick={() => openModal('__no_role__')}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm text-left transition-colors ${
                      selectedTemplate
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-amber-300 bg-amber-50 hover:border-amber-400'
                    }`}
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
                  </button>
                  <span className="text-sm text-slate-500 text-right w-12 tabular-nums">{noRoleCount}명</span>
                </div>
              );
            })()}
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

      {/* 템플릿 선택 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* 백드롭 */}
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

          {/* 모달 */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-bold text-slate-800">
                템플릿 선택
                {selectedRole && selectedRole !== '__no_role__' && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({selectedRole})
                  </span>
                )}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded">
                <X size={18} />
              </button>
            </div>

            {/* 템플릿 목록 */}
            <div className="p-2 max-h-80 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    template.id === currentSelectedTemplateId
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'hover:bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                    <img
                      src={template.dataUrl || template.thumbnailUrl || template.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {template.fileName.replace(/\.[^/.]+$/, '')}
                    </p>
                    {template.id === 'default-template' && (
                      <span className="text-[10px] text-slate-400">기본 템플릿</span>
                    )}
                  </div>
                  {template.id === currentSelectedTemplateId && (
                    <Check size={20} className="text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
