# NameTag Pro - AI-Friendly Specification Document

> 명찰 자동 생성 웹서비스 기술 기획서
> Version: 1.0 | Last Updated: 2026-01-20

---

## 1. 프로젝트 개요 (Overview)

### 1.1 서비스 정의
```yaml
name: NameTag Pro
type: Web Application (SaaS)
purpose: 단체 행사용 명찰 자동 생성 서비스
tagline: "명단만 있으면 명찰 완성"
```

### 1.2 핵심 기능 요약
```yaml
core_features:
  - 템플릿 업로드: 역할별 명찰 디자인 이미지 등록
  - 명단 업로드: Excel/CSV 파일로 대량 데이터 입력
  - 실시간 편집: 드래그로 텍스트 위치 조정, 폰트 커스터마이징
  - PDF 생성: A4 용지에 n×m 배치, 300dpi 고해상도 출력
```

### 1.3 타겟 사용자
```yaml
primary_users:
  - 종교단체: 교회, 성당 (수련회, 캠프, 세미나)
  - 교육기관: 학교 (오리엔테이션, 학술대회)
  - 기업: 컨퍼런스, 워크샵, 사내 행사
  - 커뮤니티: 동호회, 동창회

user_scale: 50명 ~ 500명 규모 행사
```

### 1.4 비즈니스 모델
```yaml
pricing_tiers:
  - plan: Free
    price: 0
    limits: { max_people: 50, watermark: true, fonts: "basic" }
    
  - plan: Basic
    price: 9900  # KRW per use
    limits: { max_people: 200, watermark: false, fonts: "standard" }
    
  - plan: Pro
    price: 19900
    limits: { max_people: unlimited, watermark: false, fonts: "premium", priority: true }
    
  - plan: Enterprise
    price: custom
    features: [api_access, white_label, dedicated_support]
```

---

## 2. 정보 구조 (Information Architecture)

### 2.1 사이트맵
```
/
├── / (Landing Page)
│   ├── Hero Section
│   ├── Features Section
│   ├── How It Works
│   ├── Pricing Section
│   └── CTA → /editor
│
├── /editor (Main Editor) ★ Core Page
│   ├── Template Upload Panel
│   ├── Data Upload Panel
│   ├── Canvas Preview
│   ├── Style Settings Panel
│   └── Export Options
│
├── /result (Result Page)
│   ├── Generated Preview Grid
│   ├── Download Options
│   └── Share/Save Options
│
├── /pricing (Pricing Page)
│   └── Plan Comparison Table
│
├── /auth
│   ├── /login
│   ├── /register
│   └── /forgot-password
│
└── /my
    ├── /projects (Saved Projects)
    ├── /templates (My Templates)
    └── /settings (Account Settings)
```

### 2.2 사용자 플로우
```
[Landing] → [Editor] → [Upload Templates] → [Upload Data] 
    → [Match Roles] → [Adjust Position] → [Set Styles] 
    → [Preview] → [Generate] → [Result] → [Download PDF]
```

### 2.3 상태 다이어그램
```yaml
editor_states:
  INITIAL:
    description: "에디터 초기 상태"
    next: [TEMPLATE_UPLOADED]
    
  TEMPLATE_UPLOADED:
    description: "템플릿 1개 이상 업로드됨"
    next: [DATA_UPLOADED]
    
  DATA_UPLOADED:
    description: "명단 파일 업로드됨"
    next: [ROLE_MATCHED]
    
  ROLE_MATCHED:
    description: "역할-템플릿 매칭 완료"
    next: [CONFIGURED]
    
  CONFIGURED:
    description: "위치/스타일 설정 완료"
    next: [GENERATING, CONFIGURED]
    
  GENERATING:
    description: "PDF 생성 중"
    next: [COMPLETED, ERROR]
    
  COMPLETED:
    description: "생성 완료, 다운로드 가능"
    next: [INITIAL]
    
  ERROR:
    description: "오류 발생"
    next: [CONFIGURED, INITIAL]
```

---

## 3. 화면 기획 (Wireframe Specification)

### 3.1 Landing Page (/)
```yaml
layout: single-column-centered
sections:
  - id: hero
    components:
      - logo: { position: top-left }
      - nav: { items: [Features, Pricing, Login], position: top-right }
      - headline: 
          text: "명단만 있으면 명찰 완성"
          style: { fontSize: 48px, fontWeight: bold }
      - subheadline:
          text: "엑셀 업로드 한 번으로 수백 장의 명찰을 자동 생성"
      - cta_button:
          text: "무료로 시작하기"
          action: navigate(/editor)
          style: { variant: primary, size: large }
      - sample_preview:
          type: image-carousel
          items: [sample1.png, sample2.png, sample3.png]

  - id: features
    layout: 3-column-grid
    items:
      - icon: upload
        title: "간편한 업로드"
        description: "드래그앤드롭으로 템플릿과 명단 업로드"
      - icon: edit
        title: "실시간 편집"
        description: "드래그로 위치 조정, 즉시 미리보기"
      - icon: download
        title: "고품질 출력"
        description: "300dpi PDF, 인쇄소 바로 전달 가능"

  - id: how-it-works
    layout: horizontal-steps
    steps:
      - step: 1
        title: "템플릿 업로드"
        description: "역할별 명찰 디자인 이미지 등록"
      - step: 2
        title: "명단 업로드"
        description: "엑셀 파일로 이름, 역할 데이터 입력"
      - step: 3
        title: "스타일 설정"
        description: "위치, 폰트, 색상 커스터마이징"
      - step: 4
        title: "PDF 다운로드"
        description: "A4 배치된 인쇄용 파일 즉시 다운로드"

  - id: pricing
    component: PricingTable
    props: { tiers: [Free, Basic, Pro, Enterprise] }

  - id: footer
    components: [copyright, social_links, contact]
```

### 3.2 Editor Page (/editor) ★
```yaml
layout: three-panel
responsive:
  desktop: [left: 280px, center: flex-1, right: 320px]
  tablet: [left: hidden, center: full, right: drawer]
  mobile: [tabs: [upload, preview, settings]]

panels:
  left_panel:
    id: upload-panel
    sections:
      - id: template-upload
        title: "템플릿"
        components:
          - dropzone:
              accept: [.jpg, .jpeg, .png]
              multiple: true
              maxSize: 10MB
              placeholder: "디자인 이미지를 드래그하거나 클릭"
          - template_list:
              type: sortable-grid
              item_actions: [preview, delete, set_role]
          - add_role_button:
              text: "+ 역할 추가"
              action: openRoleModal()
              
      - id: data-upload
        title: "명단"
        components:
          - dropzone:
              accept: [.xlsx, .xls, .csv]
              single: true
              maxSize: 5MB
          - data_preview:
              type: table
              columns: [번호, 이름, 역할]
              maxRows: 10
              footer: "총 {count}명"
          - column_mapping:
              fields:
                - label: "이름 컬럼"
                  type: select
                  options: dynamic  # from uploaded file
                - label: "역할 컬럼"
                  type: select
                  options: dynamic

      - id: role-matching
        title: "역할 매칭"
        components:
          - matching_table:
              columns: [역할명, 템플릿, 인원수]
              row_type: 
                role: text
                template: thumbnail-select
                count: badge

  center_panel:
    id: canvas-preview
    components:
      - toolbar:
          items:
            - zoom_controls: [zoom_in, zoom_out, fit]
            - sample_selector:
                type: dropdown
                label: "미리보기"
                options: dynamic  # from uploaded names
            - undo_redo: [undo, redo]
            
      - canvas:
          type: interactive
          features:
            - draggable_text: true
            - guides: true
            - snap_to_center: true
          elements:
            - background_image: current_template
            - text_layer:
                content: "{name}"
                draggable: true
                resizable: false
                
      - position_info:
          display: "X: {x}px, Y: {y}px"

  right_panel:
    id: settings-panel
    sections:
      - id: text-style
        title: "텍스트 스타일"
        components:
          - font_family:
              type: select
              options:
                - { value: "Pretendard", label: "프리텐다드" }
                - { value: "NanumGothic", label: "나눔고딕" }
                - { value: "NanumMyeongjo", label: "나눔명조" }
                - { value: "GmarketSans", label: "지마켓산스" }
              default: "Pretendard"
              
          - font_size:
              type: slider
              min: 12
              max: 72
              default: 36
              unit: "px"
              
          - font_weight:
              type: button-group
              options:
                - { value: 400, label: "Regular" }
                - { value: 700, label: "Bold" }
                
          - font_color:
              type: color-picker
              default: "#000000"
              presets: ["#000000", "#333333", "#FFFFFF", "#FF0000", "#0066CC"]

      - id: export-settings
        title: "출력 설정"
        components:
          - paper_size:
              type: select
              options:
                - { value: "A4", label: "A4 (210×297mm)" }
                - { value: "Letter", label: "Letter (216×279mm)" }
              default: "A4"
              
          - layout:
              type: grid-selector
              options:
                - { value: "2x2", label: "2×2 (4장/페이지)", preview: true }
                - { value: "2x3", label: "2×3 (6장/페이지)", preview: true }
                - { value: "3x3", label: "3×3 (9장/페이지)", preview: true }
                - { value: "2x4", label: "2×4 (8장/페이지)", preview: true }
              default: "2x2"
              
          - margin:
              type: number
              label: "여백"
              min: 0
              max: 50
              default: 10
              unit: "mm"

      - id: actions
        components:
          - preview_button:
              text: "전체 미리보기"
              variant: secondary
              action: openPreviewModal()
              
          - generate_button:
              text: "PDF 생성하기"
              variant: primary
              size: large
              action: generatePDF()
              disabled_when: state != CONFIGURED
```

### 3.3 Result Page (/result)
```yaml
layout: single-column
sections:
  - id: header
    components:
      - back_button: { action: navigate(/editor) }
      - title: "명찰 생성 완료"
      - summary: "{count}개 명찰이 생성되었습니다"

  - id: preview-grid
    components:
      - thumbnail_grid:
          columns: { desktop: 6, tablet: 4, mobile: 2 }
          item:
            - thumbnail_image
            - name_label
          pagination: true
          pageSize: 24

  - id: download-section
    components:
      - pdf_download:
          text: "PDF 다운로드"
          icon: file-pdf
          variant: primary
          size: large
          
      - zip_download:
          text: "개별 이미지 (ZIP)"
          icon: file-zip
          variant: secondary
          
      - info_text: "PDF: {pages}페이지 / ZIP: {count}개 이미지"

  - id: actions
    components:
      - save_project:
          text: "프로젝트 저장"
          requires_auth: true
      - new_project:
          text: "새 프로젝트"
          action: navigate(/editor)
```

---

## 4. 기능 명세 (Functional Specification)

### 4.1 파일 업로드

#### 4.1.1 템플릿 이미지 업로드
```yaml
function: uploadTemplate
input:
  files: File[]
  
validation:
  - rule: file.type in ['image/jpeg', 'image/png']
    error: "JPG, PNG 파일만 업로드 가능합니다"
  - rule: file.size <= 10MB
    error: "파일 크기는 10MB 이하여야 합니다"
  - rule: files.length <= 10
    error: "템플릿은 최대 10개까지 업로드 가능합니다"
  - rule: image.width >= 200 && image.height >= 200
    error: "이미지 크기는 최소 200x200px 이상이어야 합니다"

process:
  1. 파일 유효성 검사
  2. 이미지 리사이즈 (미리보기용 썸네일 생성)
  3. 임시 저장소 업로드
  4. 템플릿 목록에 추가
  5. 기본 역할명 자동 할당 ("역할 1", "역할 2", ...)

output:
  templates: Template[]
  
Template:
  id: string (uuid)
  fileName: string
  originalUrl: string
  thumbnailUrl: string
  width: number
  height: number
  role: string | null
  createdAt: timestamp
```

#### 4.1.2 명단 파일 업로드
```yaml
function: uploadRoster
input:
  file: File
  
validation:
  - rule: file.type in ['xlsx', 'xls', 'csv']
    error: "Excel 또는 CSV 파일만 업로드 가능합니다"
  - rule: file.size <= 5MB
    error: "파일 크기는 5MB 이하여야 합니다"
  - rule: rows.length >= 1
    error: "최소 1명 이상의 데이터가 필요합니다"
  - rule: rows.length <= plan.maxPeople
    error: "현재 요금제에서는 {plan.maxPeople}명까지 가능합니다"

process:
  1. 파일 파싱 (SheetJS)
  2. 컬럼 자동 감지 (이름, 역할)
  3. 데이터 정규화 (공백 제거, trim)
  4. 역할 목록 추출
  5. 미리보기 데이터 생성

output:
  roster: RosterData
  
RosterData:
  columns: string[]
  rows: Record<string, string>[]
  totalCount: number
  roles: { name: string, count: number }[]
  nameColumn: string | null  # auto-detected
  roleColumn: string | null  # auto-detected
```

### 4.2 역할 매칭

```yaml
function: matchRoles
input:
  templates: Template[]
  roster: RosterData
  mappings: RoleMapping[]
  
RoleMapping:
  roleName: string      # 엑셀의 역할명
  templateId: string    # 매칭된 템플릿 ID

auto_matching_rules:
  - 역할명이 템플릿 파일명에 포함되면 자동 매칭
  - 예: "조장" 역할 → "명찰디자인_조장.jpg" 템플릿
  
validation:
  - rule: all roles have template
    error: "모든 역할에 템플릿을 지정해주세요"
    
output:
  matchedData: MatchedPerson[]
  
MatchedPerson:
  id: string
  name: string
  role: string
  templateId: string
```

### 4.3 텍스트 위치/스타일 설정

```yaml
function: updateTextConfig
input:
  config: TextConfig
  
TextConfig:
  position:
    x: number      # 0-100 (percentage)
    y: number      # 0-100 (percentage)
    anchor: enum   # center, top-left, top-right, bottom-left, bottom-right
  style:
    fontFamily: string
    fontSize: number    # px
    fontWeight: 400 | 700
    color: string       # hex color
    
default_config:
  position: { x: 50, y: 50, anchor: "center" }
  style:
    fontFamily: "Pretendard"
    fontSize: 36
    fontWeight: 700
    color: "#000000"

validation:
  - rule: fontSize >= 12 && fontSize <= 72
  - rule: color matches /^#[0-9A-Fa-f]{6}$/
```

### 4.4 PDF 생성

```yaml
function: generatePDF
input:
  matchedData: MatchedPerson[]
  templates: Template[]
  textConfig: TextConfig
  exportConfig: ExportConfig
  
ExportConfig:
  paperSize: "A4" | "Letter"
  layout: "2x2" | "2x3" | "3x3" | "2x4"
  margin: number  # mm
  dpi: 300

process:
  1. 각 person에 대해:
     a. 해당 템플릿 이미지 로드
     b. 텍스트 합성 (이름)
     c. 개별 명찰 이미지 생성
  2. 용지 크기 계산 (DPI 기준)
  3. 레이아웃에 따라 배치
  4. 페이지별 이미지 배열
  5. PDF 문서 생성
  6. 파일 저장 및 URL 반환

output:
  result: GenerationResult
  
GenerationResult:
  pdfUrl: string
  zipUrl: string
  pageCount: number
  nametagCount: number
  generatedAt: timestamp
```

### 4.5 다운로드

```yaml
function: downloadFile
input:
  type: "pdf" | "zip"
  resultId: string

process:
  pdf:
    1. 서명된 다운로드 URL 생성 (유효기간: 1시간)
    2. 다운로드 카운트 증가
    3. URL 반환
    
  zip:
    1. 개별 이미지 파일들을 ZIP으로 압축
    2. 서명된 다운로드 URL 생성
    3. URL 반환

rate_limit:
  - Free: 3 downloads per day
  - Basic: 10 downloads per day
  - Pro: unlimited
```

---

## 5. 데이터 모델 (Data Model)

### 5.1 ERD (Entity Relationship)
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Project   │       │  Template   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ userId (FK) │  │    │ projectId   │
│ name        │  └───<│ name        │  └───<│ fileName    │
│ plan        │       │ status      │       │ imageUrl    │
│ createdAt   │       │ createdAt   │       │ role        │
└─────────────┘       │ updatedAt   │       │ width       │
                      └─────────────┘       │ height      │
                             │              └─────────────┘
                             │
                             ▼
                      ┌─────────────┐       ┌─────────────┐
                      │   Roster    │       │   Person    │
                      ├─────────────┤       ├─────────────┤
                      │ id (PK)     │──┐    │ id (PK)     │
                      │ projectId   │  │    │ rosterId    │
                      │ fileName    │  └───<│ name        │
                      │ totalCount  │       │ role        │
                      └─────────────┘       │ templateId  │
                                            └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Generation  │
                      ├─────────────┤
                      │ id (PK)     │
                      │ projectId   │
                      │ pdfUrl      │
                      │ zipUrl      │
                      │ pageCount   │
                      │ createdAt   │
                      └─────────────┘
```

### 5.2 스키마 정의

```typescript
// User
interface User {
  id: string;              // UUID
  email: string;           // unique, indexed
  name: string;
  passwordHash: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  planExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Project
interface Project {
  id: string;              // UUID
  userId: string;          // FK → User.id
  name: string;
  status: 'draft' | 'completed';
  textConfig: TextConfig;  // JSON
  exportConfig: ExportConfig;  // JSON
  createdAt: Date;
  updatedAt: Date;
}

// Template
interface Template {
  id: string;              // UUID
  projectId: string;       // FK → Project.id
  fileName: string;
  imageUrl: string;        // S3 URL
  thumbnailUrl: string;    // S3 URL
  role: string | null;
  width: number;
  height: number;
  order: number;
  createdAt: Date;
}

// Roster
interface Roster {
  id: string;              // UUID
  projectId: string;       // FK → Project.id, unique
  fileName: string;
  columns: string[];       // JSON array
  nameColumn: string;
  roleColumn: string | null;
  totalCount: number;
  createdAt: Date;
}

// Person
interface Person {
  id: string;              // UUID
  rosterId: string;        // FK → Roster.id
  name: string;
  role: string | null;
  templateId: string | null;  // FK → Template.id
  order: number;
}

// Generation
interface Generation {
  id: string;              // UUID
  projectId: string;       // FK → Project.id
  pdfUrl: string;          // S3 URL (signed)
  zipUrl: string | null;   // S3 URL (signed)
  pageCount: number;
  nametagCount: number;
  expiresAt: Date;         // URL expiration
  createdAt: Date;
}

// TextConfig (JSON in Project)
interface TextConfig {
  position: {
    x: number;             // 0-100 percentage
    y: number;             // 0-100 percentage
    anchor: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: 400 | 700;
    color: string;         // hex
  };
}

// ExportConfig (JSON in Project)
interface ExportConfig {
  paperSize: 'A4' | 'Letter';
  layout: '2x2' | '2x3' | '3x3' | '2x4';
  margin: number;          // mm
  dpi: number;
}
```

### 5.3 인덱스
```sql
-- User
CREATE INDEX idx_user_email ON users(email);

-- Project
CREATE INDEX idx_project_user ON projects(user_id);
CREATE INDEX idx_project_status ON projects(status);

-- Template
CREATE INDEX idx_template_project ON templates(project_id);

-- Person
CREATE INDEX idx_person_roster ON persons(roster_id);
CREATE INDEX idx_person_role ON persons(role);

-- Generation
CREATE INDEX idx_generation_project ON generations(project_id);
CREATE INDEX idx_generation_created ON generations(created_at);
```

---

## 6. API 명세 (API Specification)

### 6.1 Base Configuration
```yaml
base_url: https://api.nametagpro.com
version: v1
format: REST + JSON
authentication: Bearer Token (JWT)

headers:
  Content-Type: application/json
  Authorization: Bearer {token}
  
rate_limit:
  free: 100 requests/hour
  basic: 500 requests/hour
  pro: 2000 requests/hour
```

### 6.2 Endpoints

#### Auth
```yaml
POST /v1/auth/register:
  description: 회원가입
  auth: false
  request:
    body:
      email: string (required, email format)
      password: string (required, min 8 chars)
      name: string (required)
  response:
    201:
      user: User
      token: string
    400:
      error: { code: "INVALID_INPUT", message: string }
    409:
      error: { code: "EMAIL_EXISTS", message: string }

POST /v1/auth/login:
  description: 로그인
  auth: false
  request:
    body:
      email: string (required)
      password: string (required)
  response:
    200:
      user: User
      token: string
    401:
      error: { code: "INVALID_CREDENTIALS", message: string }

POST /v1/auth/refresh:
  description: 토큰 갱신
  auth: true
  response:
    200:
      token: string
```

#### Projects
```yaml
GET /v1/projects:
  description: 프로젝트 목록 조회
  auth: true
  request:
    query:
      page: number (default: 1)
      limit: number (default: 20, max: 100)
      status: 'draft' | 'completed' (optional)
  response:
    200:
      projects: Project[]
      pagination: { page, limit, total, totalPages }

POST /v1/projects:
  description: 새 프로젝트 생성
  auth: true
  request:
    body:
      name: string (required)
  response:
    201:
      project: Project

GET /v1/projects/{projectId}:
  description: 프로젝트 상세 조회
  auth: true
  response:
    200:
      project: Project
      templates: Template[]
      roster: Roster | null
      generations: Generation[]
    404:
      error: { code: "NOT_FOUND" }

PUT /v1/projects/{projectId}:
  description: 프로젝트 수정
  auth: true
  request:
    body:
      name: string (optional)
      textConfig: TextConfig (optional)
      exportConfig: ExportConfig (optional)
  response:
    200:
      project: Project

DELETE /v1/projects/{projectId}:
  description: 프로젝트 삭제
  auth: true
  response:
    204: null
```

#### Templates
```yaml
POST /v1/projects/{projectId}/templates:
  description: 템플릿 업로드
  auth: true
  request:
    content-type: multipart/form-data
    body:
      files: File[] (required, max 10)
  response:
    201:
      templates: Template[]
    400:
      error: { code: "INVALID_FILE", message: string }

PUT /v1/projects/{projectId}/templates/{templateId}:
  description: 템플릿 수정 (역할 지정)
  auth: true
  request:
    body:
      role: string (required)
  response:
    200:
      template: Template

DELETE /v1/projects/{projectId}/templates/{templateId}:
  description: 템플릿 삭제
  auth: true
  response:
    204: null
```

#### Roster
```yaml
POST /v1/projects/{projectId}/roster:
  description: 명단 업로드
  auth: true
  request:
    content-type: multipart/form-data
    body:
      file: File (required)
      nameColumn: string (optional, auto-detect if not provided)
      roleColumn: string (optional)
  response:
    201:
      roster: Roster
      persons: Person[]
    400:
      error: { code: "INVALID_FILE" | "EXCEEDS_LIMIT", message: string }

GET /v1/projects/{projectId}/roster:
  description: 명단 조회
  auth: true
  response:
    200:
      roster: Roster
      persons: Person[]
    404:
      error: { code: "NOT_FOUND" }

PUT /v1/projects/{projectId}/roster/mapping:
  description: 역할-템플릿 매칭
  auth: true
  request:
    body:
      mappings: Array<{ role: string, templateId: string }>
  response:
    200:
      persons: Person[]

DELETE /v1/projects/{projectId}/roster:
  description: 명단 삭제
  auth: true
  response:
    204: null
```

#### Generation
```yaml
POST /v1/projects/{projectId}/generate:
  description: PDF 생성 요청
  auth: true
  request:
    body:
      includeZip: boolean (default: false)
  response:
    202:
      generationId: string
      status: "processing"
    400:
      error: { code: "INCOMPLETE_CONFIG", message: string }

GET /v1/projects/{projectId}/generations/{generationId}:
  description: 생성 상태 조회
  auth: true
  response:
    200:
      generation: Generation
      status: "processing" | "completed" | "failed"
      progress: number (0-100)

GET /v1/generations/{generationId}/download:
  description: 다운로드 URL 조회
  auth: true
  request:
    query:
      type: "pdf" | "zip"
  response:
    200:
      downloadUrl: string (signed URL, expires in 1 hour)
    404:
      error: { code: "NOT_FOUND" }
```

### 6.3 Error Codes
```yaml
error_codes:
  INVALID_INPUT: 400
  INVALID_FILE: 400
  EXCEEDS_LIMIT: 400
  INCOMPLETE_CONFIG: 400
  UNAUTHORIZED: 401
  INVALID_CREDENTIALS: 401
  FORBIDDEN: 403
  NOT_FOUND: 404
  EMAIL_EXISTS: 409
  RATE_LIMITED: 429
  INTERNAL_ERROR: 500

error_response_format:
  error:
    code: string
    message: string
    details: object (optional)
```

---

## 7. UI/UX 가이드 (Design Guide)

### 7.1 디자인 토큰

```yaml
colors:
  primary:
    50: "#E8F4FD"
    100: "#C5E3FA"
    200: "#9ED0F6"
    300: "#77BDF2"
    400: "#5AAFEF"
    500: "#3D9FEB"   # Main
    600: "#3790DC"
    700: "#2D7CC8"
    800: "#2468B4"
    900: "#104694"
    
  neutral:
    0: "#FFFFFF"
    50: "#F8FAFC"
    100: "#F1F5F9"
    200: "#E2E8F0"
    300: "#CBD5E1"
    400: "#94A3B8"
    500: "#64748B"
    600: "#475569"
    700: "#334155"
    800: "#1E293B"
    900: "#0F172A"
    
  semantic:
    success: "#22C55E"
    warning: "#F59E0B"
    error: "#EF4444"
    info: "#3B82F6"

typography:
  font_family:
    primary: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
    mono: "'JetBrains Mono', monospace"
    
  font_size:
    xs: "12px"
    sm: "14px"
    base: "16px"
    lg: "18px"
    xl: "20px"
    2xl: "24px"
    3xl: "30px"
    4xl: "36px"
    5xl: "48px"
    
  font_weight:
    normal: 400
    medium: 500
    semibold: 600
    bold: 700
    
  line_height:
    tight: 1.25
    normal: 1.5
    relaxed: 1.75

spacing:
  0: "0"
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"

border_radius:
  none: "0"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"

shadow:
  sm: "0 1px 2px rgba(0,0,0,0.05)"
  md: "0 4px 6px rgba(0,0,0,0.07)"
  lg: "0 10px 15px rgba(0,0,0,0.1)"
  xl: "0 20px 25px rgba(0,0,0,0.15)"
```

### 7.2 컴포넌트 명세

```yaml
Button:
  variants:
    primary:
      background: colors.primary.500
      color: colors.neutral.0
      hover: colors.primary.600
    secondary:
      background: colors.neutral.100
      color: colors.neutral.700
      hover: colors.neutral.200
    ghost:
      background: transparent
      color: colors.neutral.600
      hover: colors.neutral.100
    danger:
      background: colors.semantic.error
      color: colors.neutral.0
      
  sizes:
    sm: { height: 32px, padding: "0 12px", fontSize: typography.font_size.sm }
    md: { height: 40px, padding: "0 16px", fontSize: typography.font_size.base }
    lg: { height: 48px, padding: "0 24px", fontSize: typography.font_size.lg }
    
  states:
    disabled: { opacity: 0.5, cursor: not-allowed }
    loading: { opacity: 0.7, cursor: wait }

Input:
  base:
    height: 40px
    padding: "0 12px"
    border: "1px solid {colors.neutral.300}"
    borderRadius: border_radius.md
    fontSize: typography.font_size.base
    
  states:
    focus: { borderColor: colors.primary.500, boxShadow: "0 0 0 3px {colors.primary.100}" }
    error: { borderColor: colors.semantic.error }
    disabled: { background: colors.neutral.100, cursor: not-allowed }

Card:
  base:
    background: colors.neutral.0
    borderRadius: border_radius.lg
    boxShadow: shadow.md
    padding: spacing.6
    
  variants:
    outlined:
      border: "1px solid {colors.neutral.200}"
      boxShadow: none

Dropzone:
  base:
    border: "2px dashed {colors.neutral.300}"
    borderRadius: border_radius.lg
    padding: spacing.8
    textAlign: center
    cursor: pointer
    transition: "all 0.2s"
    
  states:
    hover: { borderColor: colors.primary.400, background: colors.primary.50 }
    active: { borderColor: colors.primary.500, background: colors.primary.100 }
    disabled: { opacity: 0.5, cursor: not-allowed }

Modal:
  overlay:
    background: "rgba(0, 0, 0, 0.5)"
    backdropFilter: "blur(4px)"
    
  content:
    background: colors.neutral.0
    borderRadius: border_radius.xl
    boxShadow: shadow.xl
    maxWidth: 500px
    padding: spacing.6
```

### 7.3 반응형 브레이크포인트
```yaml
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px

responsive_behavior:
  editor_page:
    desktop (>= lg):
      layout: three-panel
      left_panel: visible
      right_panel: visible
      
    tablet (md - lg):
      layout: two-panel
      left_panel: collapsible
      right_panel: drawer
      
    mobile (< md):
      layout: single-panel
      navigation: bottom-tabs
      panels: [upload, preview, settings]
```

### 7.4 애니메이션
```yaml
transitions:
  fast: "150ms ease"
  normal: "200ms ease"
  slow: "300ms ease"

animations:
  fadeIn:
    from: { opacity: 0 }
    to: { opacity: 1 }
    duration: transitions.normal
    
  slideUp:
    from: { opacity: 0, transform: "translateY(10px)" }
    to: { opacity: 1, transform: "translateY(0)" }
    duration: transitions.normal
    
  scaleIn:
    from: { opacity: 0, transform: "scale(0.95)" }
    to: { opacity: 1, transform: "scale(1)" }
    duration: transitions.fast
    
  spin:
    keyframes: "rotate 1s linear infinite"
```

### 7.5 아이콘
```yaml
icon_library: Lucide React
icon_size:
  sm: 16px
  md: 20px
  lg: 24px
  xl: 32px

commonly_used_icons:
  - Upload, Download, FileText, Image
  - Plus, Minus, X, Check
  - ChevronLeft, ChevronRight, ChevronDown
  - Settings, User, LogOut
  - Edit, Trash, Copy
  - ZoomIn, ZoomOut, Maximize
  - Loader (for loading states)
```

---

## 8. 기술 스택 (Tech Stack)

### 8.1 프론트엔드
```yaml
framework:
  name: Next.js
  version: "14.x"
  features: [App Router, Server Components, API Routes]

language:
  name: TypeScript
  version: "5.x"
  strict: true

styling:
  primary: Tailwind CSS (v3.x)
  components: shadcn/ui
  animations: Framer Motion

state_management:
  client: Zustand
  server: TanStack Query (React Query)

key_libraries:
  - name: Konva.js
    purpose: Canvas 기반 이미지 편집
    
  - name: react-dropzone
    purpose: 파일 드래그앤드롭 업로드
    
  - name: xlsx (SheetJS)
    purpose: 엑셀 파일 파싱
    
  - name: react-hook-form
    purpose: 폼 상태 관리
    
  - name: zod
    purpose: 스키마 검증
    
  - name: lucide-react
    purpose: 아이콘

dev_tools:
  - ESLint + Prettier
  - Husky (pre-commit hooks)
  - Vitest + Testing Library
```

### 8.2 백엔드
```yaml
framework:
  name: Spring Boot
  version: "3.2.x"
  
language:
  name: Java
  version: "17"

key_libraries:
  - name: Spring Web
    purpose: REST API
    
  - name: Spring Security
    purpose: 인증/인가
    
  - name: Spring Data JPA
    purpose: 데이터 액세스
    
  - name: Apache PDFBox
    purpose: PDF 생성
    
  - name: Apache POI
    purpose: 엑셀 파일 처리
    
  - name: Java AWT / ImageIO
    purpose: 이미지 처리
    
  - name: AWS SDK
    purpose: S3 연동
    
  - name: jjwt
    purpose: JWT 토큰

database:
  primary:
    name: PostgreSQL
    version: "15.x"
    
  cache:
    name: Redis
    version: "7.x"
    purpose: 세션, Rate Limiting
```

### 8.3 인프라
```yaml
cloud_provider: AWS

services:
  compute:
    - name: EC2
      type: t3.medium
      purpose: API 서버
      
    - name: Lambda
      purpose: PDF 생성 (비동기)
      runtime: java17
      memory: 1024MB
      timeout: 60s

  storage:
    - name: S3
      buckets:
        - nametag-uploads (템플릿, 명단)
        - nametag-outputs (생성된 PDF)
      lifecycle:
        outputs: 7 days expiration

  database:
    - name: RDS (PostgreSQL)
      instance: db.t3.small
      
    - name: ElastiCache (Redis)
      instance: cache.t3.micro

  cdn:
    - name: CloudFront
      origins: [S3, API Gateway]

  networking:
    - name: VPC
    - name: ALB (Application Load Balancer)
    - name: Route 53 (DNS)

  monitoring:
    - name: CloudWatch
      metrics: [CPU, Memory, Request Count, Error Rate]
      alarms: [High CPU, High Error Rate]
      
    - name: X-Ray
      purpose: 분산 트레이싱

ci_cd:
  frontend:
    platform: Vercel
    branch_deploy: true
    
  backend:
    platform: GitHub Actions
    steps:
      - test
      - build
      - docker push (ECR)
      - deploy (ECS or EC2)
```

### 8.4 개발 환경
```yaml
local_development:
  frontend:
    command: npm run dev
    port: 3000
    
  backend:
    command: ./gradlew bootRun
    port: 8080
    profile: local
    
  database:
    docker-compose:
      postgres: 5432
      redis: 6379

environment_variables:
  frontend:
    NEXT_PUBLIC_API_URL: string
    NEXT_PUBLIC_S3_BUCKET: string
    
  backend:
    DATABASE_URL: string
    REDIS_URL: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_S3_BUCKET: string
    JWT_SECRET: string
```

---

## 부록: 체크리스트

### MVP 기능 체크리스트
```
[ ] 랜딩 페이지
[ ] 템플릿 업로드 (다중)
[ ] 명단 업로드 (Excel)
[ ] 역할 자동 감지
[ ] 역할-템플릿 매칭 UI
[ ] 캔버스 미리보기
[ ] 텍스트 드래그 위치 조정
[ ] 폰트 설정 (종류, 크기, 색상)
[ ] PDF 생성 (2x2 레이아웃)
[ ] PDF 다운로드
[ ] 반응형 디자인 (모바일)
```

### Phase 2 기능
```
[ ] 사용자 인증 (로그인/회원가입)
[ ] 프로젝트 저장/불러오기
[ ] 다양한 레이아웃 옵션
[ ] ZIP 다운로드 (개별 이미지)
[ ] 요금제 결제
```

### Phase 3 기능
```
[ ] QR코드 삽입
[ ] 사진 포함 명찰
[ ] 템플릿 마켓플레이스
[ ] 공유 기능
[ ] API 제공
```

---

*Document generated for AI-assisted development*
*Format: Structured YAML + TypeScript for easy parsing*