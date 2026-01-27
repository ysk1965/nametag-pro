import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Template, Person, TextConfig, ExportConfig, EditorState, RoleCount, TextField, TemplateMode, CustomFont, DefaultTemplateConfig } from '@/types';

// 기본 텍스트 필드 스타일
const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Pretendard',
  fontSize: 36,
  fontWeight: 700 as const,
  color: '#000000',
};

// 기본 명찰 템플릿 (SVG를 data URL로 인코딩)
const DEFAULT_TEMPLATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="100%" style="stop-color:#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="240" fill="url(#bg)"/>
  <rect x="10" y="10" width="380" height="220" rx="12" fill="white" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="360" height="50" rx="6" fill="#3b82f6"/>
  <text x="200" y="52" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">NAME TAG</text>
  <line x1="40" y1="180" x2="360" y2="180" stroke="#e2e8f0" stroke-width="2"/>
  <text x="200" y="210" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Company / Organization</text>
</svg>`;

const DEFAULT_TEMPLATE_DATA_URL = `data:image/svg+xml;base64,${typeof window !== 'undefined' ? btoa(DEFAULT_TEMPLATE_SVG) : ''}`;

// 기본 템플릿 객체
const createDefaultTemplate = (): Template => ({
  id: 'default-template',
  fileName: '기본 명찰.svg',
  imageUrl: DEFAULT_TEMPLATE_DATA_URL,
  dataUrl: DEFAULT_TEMPLATE_DATA_URL,
  width: 400,
  height: 240,
  role: null,
});

interface EditorStore {
  // State
  projectId: string | null;
  state: EditorState;
  templates: Template[];
  selectedTemplateId: string | null;  // 현재 선택된 템플릿
  templateMode: TemplateMode;          // 싱글/멀티 템플릿 모드
  persons: Person[];

  // Custom fonts
  customFonts: CustomFont[];

  // Column configuration
  columns: string[];                    // 현재 데이터의 모든 컬럼
  textFields: TextField[];              // 텍스트 필드 설정 (여러 개 가능)
  templateColumn: string | null;        // 템플릿 매칭용 컬럼
  selectedTextFieldId: string | null;   // 현재 선택된 텍스트 필드
  showColumnConfigModal: boolean;       // 컬럼 선택 모달 표시 여부

  // Role counts (템플릿 매칭용)
  roleCounts: RoleCount[];
  roleMappings: Record<string, string>; // roleName -> templateId
  roleColors: Record<string, string>;   // roleName -> color (기본 명찰 멀티 템플릿용)

  // Design mode
  designMode: 'default' | 'custom';

  // Default template customization
  defaultTemplateConfig: DefaultTemplateConfig;

  // Legacy textConfig (하위 호환성)
  textConfig: TextConfig;
  exportConfig: ExportConfig;

  selectedSampleIndex: number;
  generatedPdfUrl: string | null;
  error: string | null;

  // Actions
  setProjectId: (id: string | null) => void;
  setState: (state: EditorState) => void;

  // Template actions
  setTemplates: (templates: Template[]) => void;
  addTemplates: (templates: Template[]) => void;
  removeTemplate: (id: string) => void;
  updateTemplateRole: (id: string, role: string | null) => void;
  selectTemplate: (id: string) => void;
  setTemplateMode: (mode: TemplateMode) => void;

  // Person actions
  setPersons: (persons: Person[], columns?: string[]) => void;
  clearPersons: () => void;

  // Column config actions
  setColumns: (columns: string[]) => void;
  setTemplateColumn: (column: string | null) => void;
  setShowColumnConfigModal: (show: boolean) => void;

  // Text field actions
  addTextField: (column: string) => void;
  removeTextField: (id: string) => void;
  updateTextField: (id: string, updates: Partial<Omit<TextField, 'id'>>) => void;
  setSelectedTextField: (id: string | null) => void;
  updateTextFieldPosition: (id: string, x: number, y: number) => void;
  updateTextFieldStyle: (id: string, style: Partial<TextField['style']>) => void;

  // Role mapping actions
  setRoleCounts: (counts: RoleCount[]) => void;
  updateRoleMapping: (role: string, templateId: string) => void;
  updateRoleColor: (role: string, color: string) => void;

  // Design mode actions
  setDesignMode: (mode: 'default' | 'custom') => void;

  // Default template config actions
  setDefaultTemplateConfig: (config: Partial<DefaultTemplateConfig>) => void;

  // Legacy config actions (하위 호환성)
  setTextConfig: (config: Partial<TextConfig>) => void;
  setTextPosition: (x: number, y: number) => void;
  setTextStyle: (style: Partial<TextConfig['style']>) => void;
  setExportConfig: (config: Partial<ExportConfig>) => void;

  // Preview actions
  setSelectedSampleIndex: (index: number) => void;

  // Generation actions
  setGeneratedPdfUrl: (url: string | null) => void;
  setError: (error: string | null) => void;

  // Custom font actions
  addCustomFont: (font: CustomFont) => void;
  removeCustomFont: (id: string) => void;
  setFontLoaded: (id: string, loaded: boolean) => void;

  // Utility actions
  reset: () => void;
  canGenerate: () => boolean;
  ensureDefaultTemplate: () => void;
}

const DEFAULT_TEXT_CONFIG: TextConfig = {
  position: { x: 50, y: 50, anchor: 'center' },
  style: DEFAULT_TEXT_STYLE,
};

const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  paperSize: 'A4',
  layout: '2x2',
  margin: 12,
  dpi: 300,
  sizeMode: 'grid',  // 기본값: 그리드 모드
  gridGap: 7,        // mm (명찰 사이 간격)
  fixedWidth: 90,    // mm (고정 크기 모드용)
  fixedHeight: 55,   // mm
  blankPages: 0,     // 빈 명찰 수 (템플릿 1개일 때)
  blankPagesPerTemplate: {},  // 템플릿별 빈 명찰 수
};

const DEFAULT_TEMPLATE_CONFIG: DefaultTemplateConfig = {
  headerText: 'NAME TAG',
  footerText: 'Company / Organization',
  headerHeight: 22,
  headerColor: '#3b82f6',
};

// 초기 상태 생성 함수 (클라이언트에서 기본 템플릿 포함)
const getInitialState = () => {
  const defaultTemplate = typeof window !== 'undefined' ? createDefaultTemplate() : null;
  return {
    projectId: null,
    state: 'INITIAL' as EditorState,
    templates: defaultTemplate ? [defaultTemplate] : [],
    selectedTemplateId: defaultTemplate?.id || null,
    templateMode: 'single' as TemplateMode,
    persons: [],
    columns: [],
    textFields: [],
    templateColumn: null,
    selectedTextFieldId: null,
    showColumnConfigModal: false,
    roleCounts: [],
    roleMappings: {},
    roleColors: {},
    designMode: 'default' as const,
    defaultTemplateConfig: DEFAULT_TEMPLATE_CONFIG,
    customFonts: [] as CustomFont[],
    textConfig: DEFAULT_TEXT_CONFIG,
    exportConfig: DEFAULT_EXPORT_CONFIG,
    selectedSampleIndex: 0,
    generatedPdfUrl: null,
    error: null,
  };
};

const initialState = getInitialState();

// 컬럼명에서 역할 자동 감지
function detectRoleColumn(columns: string[]): string | null {
  const rolePatterns = ['역할', 'role', '직분', '구분', '직책', '그룹', '소속', '팀'];
  return columns.find((col) =>
    rolePatterns.some((pattern) => col.toLowerCase().includes(pattern.toLowerCase()))
  ) || null;
}

// 컬럼명에서 이름 자동 감지
function detectNameColumn(columns: string[]): string | null {
  const namePatterns = ['이름', 'name', '성명', '참가자', '참석자'];
  return columns.find((col) =>
    namePatterns.some((pattern) => col.toLowerCase().includes(pattern.toLowerCase()))
  ) || null;
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setProjectId: (id) => set({ projectId: id }),
        setState: (state) => set({ state }),

        // Template actions
        setTemplates: (templates) => set({ templates }),

        addTemplates: (newTemplates) =>
          set((state) => {
            const templates = [...state.templates, ...newTemplates];
            // 새로 추가된 첫 번째 템플릿을 자동 선택
            const selectedTemplateId = newTemplates.length > 0
              ? newTemplates[0].id
              : state.selectedTemplateId;

            // 첫 번째 커스텀 템플릿이면 이미지 크기에 맞게 exportConfig 설정
            // (기본 템플릿 제외하고 카운트)
            let exportConfig = state.exportConfig;
            const existingCustomTemplates = state.templates.filter(t => t.id !== 'default-template');
            if (existingCustomTemplates.length === 0 && newTemplates.length > 0) {
              const firstTemplate = newTemplates[0];
              // 픽셀을 mm로 변환 (10px = 1mm 기준, 최대 150mm 제한)
              // 원본 비율을 정확히 유지하기 위해 너비 기준으로 높이 계산
              const scale = 0.1;
              const maxDimension = 150;
              const minDimension = 20;
              const aspectRatio = firstTemplate.width / firstTemplate.height;

              let width = firstTemplate.width * scale;
              let height = firstTemplate.height * scale;

              // 최대 크기 제한 (비율 유지)
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  width = maxDimension;
                  height = width / aspectRatio;
                } else {
                  height = maxDimension;
                  width = height * aspectRatio;
                }
              }

              // 최소 크기 보장 (비율 유지)
              if (width < minDimension || height < minDimension) {
                if (width < height) {
                  width = minDimension;
                  height = width / aspectRatio;
                } else {
                  height = minDimension;
                  width = height * aspectRatio;
                }
              }

              // 소수점 첫째 자리까지 유지 (비율 보존)
              width = Math.round(width * 10) / 10;
              height = Math.round(height * 10) / 10;

              exportConfig = {
                ...state.exportConfig,
                fixedWidth: width,
                fixedHeight: height,
                // sizeMode는 기본값 'grid' 유지
              };
            }

            return {
              templates,
              selectedTemplateId,
              exportConfig,
              state: templates.length > 0 ? 'TEMPLATE_UPLOADED' : state.state,
            };
          }),

        removeTemplate: (id) =>
          set((state) => {
            const templates = state.templates.filter((t) => t.id !== id);
            const roleMappings = { ...state.roleMappings };
            for (const [role, templateId] of Object.entries(roleMappings)) {
              if (templateId === id) {
                delete roleMappings[role];
              }
            }
            // 삭제된 템플릿이 선택된 템플릿이면 첫 번째 템플릿 선택
            const selectedTemplateId = state.selectedTemplateId === id
              ? templates[0]?.id || null
              : state.selectedTemplateId;
            return {
              templates,
              selectedTemplateId,
              roleMappings,
              state: templates.length === 0 ? 'INITIAL' : state.state,
            };
          }),

        updateTemplateRole: (id, role) =>
          set((state) => ({
            templates: state.templates.map((t) =>
              t.id === id ? { ...t, role } : t
            ),
          })),

        selectTemplate: (id) => set({ selectedTemplateId: id }),

        setTemplateMode: (mode) =>
          set((state) => {
            // 싱글 모드로 변경 시 템플릿 컬럼 및 역할 매핑 초기화
            if (mode === 'single') {
              return {
                templateMode: mode,
                templateColumn: null,
                roleMappings: {},
                roleColors: {},
                roleCounts: [],
              };
            }
            return { templateMode: mode };
          }),

        // Person actions
        setPersons: (persons, columns) =>
          set((state) => {
            // 컬럼 설정
            const newColumns = columns || state.columns;

            // 템플릿 컬럼 자동 감지
            let templateColumn = state.templateColumn;
            if (!templateColumn && newColumns.length > 0) {
              templateColumn = detectRoleColumn(newColumns);
            }

            // 텍스트 필드 자동 생성 (비어있으면)
            let textFields = state.textFields;
            if (textFields.length === 0 && newColumns.length > 0) {
              const nameColumn = detectNameColumn(newColumns);
              if (nameColumn) {
                textFields = [{
                  id: `field-${Date.now()}`,
                  column: nameColumn,
                  label: nameColumn,
                  position: { x: 50, y: 50 },
                  style: { ...DEFAULT_TEXT_STYLE },
                }];
              }
            }

            // 역할 카운트 계산
            const roleMap = new Map<string, number>();
            if (templateColumn) {
              persons.forEach((p) => {
                const roleValue = p.data[templateColumn!];
                if (roleValue) {
                  roleMap.set(roleValue, (roleMap.get(roleValue) || 0) + 1);
                }
              });
            }
            const roleCounts = Array.from(roleMap.entries()).map(([role, count]) => ({
              role,
              count,
            }));

            return {
              persons,
              columns: newColumns,
              templateColumn,
              textFields,
              roleCounts,
              selectedTextFieldId: textFields.length > 0 ? textFields[0].id : null,
              state: persons.length > 0 ? 'DATA_UPLOADED' : state.state,
              showColumnConfigModal: persons.length > 0 && newColumns.length > 0,
            };
          }),

        clearPersons: () =>
          set((state) => ({
            persons: [],
            columns: [],
            textFields: [],
            templateColumn: null,
            selectedTextFieldId: null,
            showColumnConfigModal: false,
            roleCounts: [],
            roleMappings: {},
            state: state.templates.length > 0 ? 'TEMPLATE_UPLOADED' : 'INITIAL',
          })),

        // Column config actions
        setColumns: (columns) => set({ columns }),

        setShowColumnConfigModal: (show) => set({ showColumnConfigModal: show }),

        setTemplateColumn: (column) =>
          set((state) => {
            // 역할 카운트 재계산
            const roleMap = new Map<string, number>();
            if (column) {
              state.persons.forEach((p) => {
                const roleValue = p.data[column];
                if (roleValue) {
                  roleMap.set(roleValue, (roleMap.get(roleValue) || 0) + 1);
                }
              });
            }
            const roleCounts = Array.from(roleMap.entries()).map(([role, count]) => ({
              role,
              count,
            }));

            return {
              templateColumn: column,
              roleCounts,
              roleMappings: {}, // 컬럼 변경 시 매핑 초기화
              roleColors: {},   // 컬럼 변경 시 색상 초기화
            };
          }),

        // Text field actions
        addTextField: (column) =>
          set((state) => {
            const newField: TextField = {
              id: `field-${Date.now()}`,
              column,
              label: column,
              position: { x: 50, y: 30 + state.textFields.length * 20 }, // 간격 두고 배치
              style: { ...DEFAULT_TEXT_STYLE, fontSize: 24 },
            };
            return {
              textFields: [...state.textFields, newField],
              selectedTextFieldId: newField.id,
            };
          }),

        removeTextField: (id) =>
          set((state) => {
            const textFields = state.textFields.filter((f) => f.id !== id);
            return {
              textFields,
              selectedTextFieldId:
                state.selectedTextFieldId === id
                  ? textFields[0]?.id || null
                  : state.selectedTextFieldId,
            };
          }),

        updateTextField: (id, updates) =>
          set((state) => ({
            textFields: state.textFields.map((f) =>
              f.id === id ? { ...f, ...updates } : f
            ),
          })),

        setSelectedTextField: (id) => set({ selectedTextFieldId: id }),

        updateTextFieldPosition: (id, x, y) =>
          set((state) => ({
            textFields: state.textFields.map((f) =>
              f.id === id ? { ...f, position: { x, y } } : f
            ),
          })),

        updateTextFieldStyle: (id, style) =>
          set((state) => ({
            textFields: state.textFields.map((f) =>
              f.id === id ? { ...f, style: { ...f.style, ...style } } : f
            ),
          })),

        // Role mapping actions
        setRoleCounts: (roleCounts) => set({ roleCounts }),

        updateRoleMapping: (role, templateId) =>
          set((state) => {
            const roleMappings = { ...state.roleMappings, [role]: templateId };
            const allRolesMapped = state.roleCounts.every(
              (rc) => roleMappings[rc.role]
            );
            return {
              roleMappings,
              state: allRolesMapped ? 'CONFIGURED' : 'ROLE_MATCHED',
            };
          }),

        updateRoleColor: (role, color) =>
          set((state) => {
            const roleColors = { ...state.roleColors, [role]: color };
            const allRolesColored = state.roleCounts.every(
              (rc) => roleColors[rc.role]
            );
            return {
              roleColors,
              state: allRolesColored ? 'CONFIGURED' : 'ROLE_MATCHED',
            };
          }),

        setDesignMode: (mode) =>
          set((state) => {
            // 디자인 모드 변경 시 기본 템플릿 선택 처리
            if (mode === 'default') {
              const defaultTemplate = state.templates.find(t => t.id === 'default-template');
              return {
                designMode: mode,
                selectedTemplateId: defaultTemplate?.id || state.selectedTemplateId,
              };
            }
            // custom 모드로 변경 시 커스텀 템플릿 선택
            const customTemplate = state.templates.find(t => t.id !== 'default-template');
            return {
              designMode: mode,
              selectedTemplateId: customTemplate?.id || state.selectedTemplateId,
            };
          }),

        // Default template config actions
        setDefaultTemplateConfig: (config) =>
          set((state) => ({
            defaultTemplateConfig: { ...state.defaultTemplateConfig, ...config },
          })),

        // Legacy config actions (하위 호환성)
        setTextConfig: (config) =>
          set((state) => ({
            textConfig: { ...state.textConfig, ...config },
          })),

        setTextPosition: (x, y) =>
          set((state) => {
            // 선택된 텍스트 필드가 있으면 해당 필드 업데이트
            if (state.selectedTextFieldId) {
              return {
                textFields: state.textFields.map((f) =>
                  f.id === state.selectedTextFieldId
                    ? { ...f, position: { x, y } }
                    : f
                ),
                textConfig: {
                  ...state.textConfig,
                  position: { ...state.textConfig.position, x, y },
                },
              };
            }
            return {
              textConfig: {
                ...state.textConfig,
                position: { ...state.textConfig.position, x, y },
              },
            };
          }),

        setTextStyle: (style) =>
          set((state) => {
            // 선택된 텍스트 필드가 있으면 해당 필드 업데이트
            if (state.selectedTextFieldId) {
              return {
                textFields: state.textFields.map((f) =>
                  f.id === state.selectedTextFieldId
                    ? { ...f, style: { ...f.style, ...style } }
                    : f
                ),
                textConfig: {
                  ...state.textConfig,
                  style: { ...state.textConfig.style, ...style },
                },
              };
            }
            return {
              textConfig: {
                ...state.textConfig,
                style: { ...state.textConfig.style, ...style },
              },
            };
          }),

        setExportConfig: (config) =>
          set((state) => ({
            exportConfig: { ...state.exportConfig, ...config },
          })),

        // Preview actions
        setSelectedSampleIndex: (index) => set({ selectedSampleIndex: index }),

        // Generation actions
        setGeneratedPdfUrl: (url) =>
          set({ generatedPdfUrl: url, state: url ? 'COMPLETED' : 'CONFIGURED' }),

        setError: (error) =>
          set((state) => ({ error, state: error ? 'ERROR' : state.state })),

        // Custom font actions
        addCustomFont: (font) =>
          set((state) => ({
            customFonts: [...state.customFonts, font],
          })),

        removeCustomFont: (id) =>
          set((state) => ({
            customFonts: state.customFonts.filter((f) => f.id !== id),
          })),

        setFontLoaded: (id, loaded) =>
          set((state) => ({
            customFonts: state.customFonts.map((f) =>
              f.id === id ? { ...f, loaded } : f
            ),
          })),

        // Utility actions
        reset: () => set(getInitialState()),

        canGenerate: () => {
          const state = get();
          return state.templates.length > 0 && state.persons.length > 0 && state.textFields.length > 0;
        },

        ensureDefaultTemplate: () => {
          const state = get();
          if (state.templates.length === 0 && typeof window !== 'undefined') {
            const defaultTemplate = createDefaultTemplate();
            set({
              templates: [defaultTemplate],
              selectedTemplateId: defaultTemplate.id,
            });
          }
          // 선택된 템플릿이 없으면 첫 번째 템플릿 선택
          if (!state.selectedTemplateId && state.templates.length > 0) {
            set({ selectedTemplateId: state.templates[0].id });
          }
        },
      }),
      {
        name: 'nametag-editor-store',
        partialize: (state) => ({
          textConfig: state.textConfig,
          exportConfig: state.exportConfig,
          defaultTemplateConfig: state.defaultTemplateConfig,
          // customFonts의 dataUrl은 너무 커서 localStorage 한도를 초과할 수 있으므로 제외
          // 페이지 새로고침 시 폰트를 다시 업로드해야 함
          customFonts: state.customFonts.map(({ dataUrl, ...rest }) => ({ ...rest, dataUrl: '' })),
        }),
        onRehydrateStorage: () => (state) => {
          // 리하이드레이션 후 기본 템플릿이 없으면 추가
          if (state && typeof window !== 'undefined') {
            if (state.templates.length === 0) {
              state.templates = [createDefaultTemplate()];
            }
          }
        },
      }
    )
  )
);
