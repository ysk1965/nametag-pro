# Documentation Changelog

## [2025-01-22]

### Tech v1.1.0
- Added: next-intl (다국어 지원)
- Added: @sentry/nextjs (에러 트래킹)
- Added: i18n 설정 가이드
- Added: SEO 설정 (sitemap, robots, JSON-LD)
- Added: Sentry 설정 가이드

### IA v1.1.0
- Changed: 폴더 구조 재구성 (`[locale]` 기반 라우팅)
- Added: `frontend/messages/` 번역 파일 폴더
- Added: `frontend/src/i18n/` 국제화 설정 폴더
- Added: `frontend/src/components/seo/` SEO 컴포넌트
- Added: `frontend/src/middleware.ts` i18n 미들웨어
- Added: sitemap.ts, robots.ts 동적 생성 파일

### Wireframe v1.1.0
- Added: LanguageSwitcher 컴포넌트 (2가지 변형)
- Added: FAQSection 컴포넌트 (아코디언)
- Added: HowItWorksSection 컴포넌트
- Changed: 컴포넌트 계층 구조 업데이트

---

## [2025-01-21]

### Initial Release (v1.0.0)

#### IA v1.0.0
- 프로젝트 구조 문서화
- 모듈 아키텍처 정의
- 페이지 구조 및 네비게이션 흐름

#### Wireframe v1.0.0
- 랜딩 페이지 UI 구조
- 에디터 페이지 3-column 레이아웃
- 모달 다이얼로그 디자인
- 컴포넌트 계층 구조

#### Design v1.0.0
- 컬러 팔레트 (Primary, Neutral, Semantic)
- 타이포그래피 시스템
- 스페이싱 및 Border Radius
- 컴포넌트 스타일 (Buttons, Cards, Inputs)
- 애니메이션 정의

#### ERD v1.0.0
- 데이터베이스 스키마 설계
- 5개 테이블 정의 (projects, templates, rosters, persons, generations)
- 관계 다이어그램 (Mermaid)
- JSONB 컬럼 구조

#### API v1.0.0
- REST API 엔드포인트 문서화
- Projects API (CRUD)
- Templates API (Upload, Update, Delete)
- Roster API (Upload, Mapping)
- 에러 코드 정의

#### Tech v1.0.0
- Frontend 기술 스택 (Next.js 14, React 18, Zustand)
- Backend 기술 스택 (Spring Boot 3.2, PostgreSQL)
- Infrastructure (AWS S3, EC2, RDS)
- 아키텍처 패턴 설명
