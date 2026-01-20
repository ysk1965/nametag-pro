// ===== Custom Font Types =====
export interface CustomFont {
  id: string;
  name: string;           // 사용자가 지정한 폰트 이름
  fontFamily: string;     // CSS font-family 값 (고유하게 생성)
  fileName: string;       // 원본 파일명
  dataUrl: string;        // base64 data URL
  loaded: boolean;        // 브라우저에 로드 완료 여부
}

// ===== Template Types =====
export interface Template {
  id: string;
  fileName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  dataUrl?: string; // For client-side preview
  width: number;
  height: number;
  role: string | null;
}

// ===== Roster Types =====
export interface Person {
  id: string;
  data: Record<string, string>; // 동적 컬럼 데이터 (예: { "이름": "홍길동", "소속": "개발팀" })
  templateId?: string | null;
}

export interface Roster {
  id: string;
  fileName: string;
  columns: string[];
  totalCount: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

// ===== Column Config Types =====
export interface ColumnConfig {
  column: string;           // 컬럼명
  type: 'text' | 'template'; // text: 명찰에 표시, template: 템플릿 매칭용
  enabled: boolean;
}

// ===== Text Field Types =====
export interface TextField {
  id: string;
  column: string;           // 어떤 컬럼 데이터를 표시할지
  label: string;            // 표시 이름 (예: "이름", "소속")
  position: {
    x: number;              // 0-100 percentage
    y: number;
  };
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: 400 | 700;
    color: string;
  };
}

// ===== Config Types =====
export interface TextConfig {
  position: {
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
    anchor?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: 400 | 700;
    color: string;
  };
}

export interface ExportConfig {
  paperSize: 'A4' | 'Letter';
  layout: '2x2' | '2x3' | '3x3' | '2x4';
  margin: number; // mm
  dpi: number;
  // 고정 크기 모드
  sizeMode: 'auto' | 'fixed'; // auto: 레이아웃 기반, fixed: 고정 크기
  fixedWidth: number;  // mm (고정 크기 모드용)
  fixedHeight: number; // mm (고정 크기 모드용)
  // 빈 페이지 (수동 작업용)
  blankPages: number;  // 추가할 빈 페이지 수
}

// ===== Project Types =====
export interface Project {
  id: string;
  name: string;
  status: 'draft' | 'completed';
  textConfig: TextConfig;
  exportConfig: ExportConfig;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Generation Types =====
export interface Generation {
  id: string;
  pdfUrl: string | null;
  zipUrl: string | null;
  pageCount: number;
  nametagCount: number;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  createdAt: string;
}

// ===== Template Mode =====
export type TemplateMode = 'single' | 'multi';

// ===== Editor State Types =====
export type EditorState =
  | 'INITIAL'
  | 'TEMPLATE_UPLOADED'
  | 'DATA_UPLOADED'
  | 'ROLE_MATCHED'
  | 'CONFIGURED'
  | 'GENERATING'
  | 'COMPLETED'
  | 'ERROR';

// ===== API Response Types =====
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
