'use client';

import { TemplateUpload } from './template-upload';
import { TemplateList } from './template-list';
import { DataUpload } from './data-upload';
import { DataPreview } from './data-preview';
import { ColumnConfig } from './column-config';
import { RoleMapping } from './role-mapping';
import { useEditorStore } from '@/stores/editor-store';

export function LeftPanel() {
  const { templates, persons, columns, roleCounts } = useEditorStore();

  // 컬럼 설정 섹션 표시 조건: 명단이 있고 컬럼이 있을 때
  const showColumnConfig = persons.length > 0 && columns.length > 0;

  // 역할 매칭 섹션 표시 조건: 템플릿과 명단 모두 있고, 역할이 있거나 템플릿이 여러개일 때
  const showRoleMapping = templates.length > 0 && persons.length > 0 &&
    (roleCounts.length > 0 || templates.length > 1);

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
        <div className="space-y-3">
          <TemplateList />
          <TemplateUpload />
        </div>
      </section>

      {/* Role Mapping Section */}
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
