# Project Documentation

> **NameTag Pro** - 명찰 대량 생성 웹 애플리케이션
>
> Last updated: 2025-01-22

## Documents

| Type | Latest | Last Updated | History |
|------|--------|--------------|---------|
| [IA](./IA/latest.md) | v1.1.0 | 2025-01-22 | [versions](./IA/) |
| [Wireframe](./Wireframe/latest.md) | v1.1.0 | 2025-01-22 | [versions](./Wireframe/) |
| [Design](./Design/latest.md) | v1.0.0 | 2025-01-21 | [versions](./Design/) |
| [ERD](./ERD/latest.md) | v1.0.0 | 2025-01-21 | [versions](./ERD/) |
| [API](./API/latest.md) | v1.0.0 | 2025-01-21 | [versions](./API/) |
| [Tech](./Tech/latest.md) | v1.1.0 | 2025-01-22 | [versions](./Tech/) |

## Quick Links

- [Full Changelog](./CHANGELOG.md)
- [API Endpoints](./API/latest.md#endpoints)
- [Database Schema](./ERD/latest.md#er-diagram)
- [Component Structure](./Wireframe/latest.md#component-hierarchy)
- [Color Palette](./Design/latest.md#color-palette)

## Document Types

| Type | Description |
|------|-------------|
| **IA** | Information Architecture - 프로젝트 구조, 모듈, 페이지 흐름 |
| **Wireframe** | UI 구조 - 컴포넌트 레이아웃, 모달, 사용자 흐름 |
| **Design** | 디자인 시스템 - 색상, 타이포그래피, 컴포넌트 스타일 |
| **ERD** | 데이터베이스 스키마 - 테이블, 관계, JSONB 구조 |
| **API** | API 명세 - 엔드포인트, 요청/응답, 에러 코드 |
| **Tech** | 기술 스택 - 라이브러리, 아키텍처, 인프라 |

## How to Update

```bash
# 전체 문서 업데이트
/write-docs

# 특정 문서만 업데이트
/write-docs api
/write-docs erd api

# 상태 확인
/write-docs status
```

## Version History

각 문서는 독립적인 버전 관리를 합니다.

- **Major (X.0.0)**: 구조적 변경, 대규모 추가/삭제
- **Minor (0.X.0)**: 새 기능, 테이블/API 추가
- **Patch (0.0.X)**: 오타 수정, 설명 보완
