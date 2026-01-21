---
title: API Documentation
version: 1.0.0
updated: 2025-01-21
history:
  - v1.0.0: 2025-01-21 - Initial release
---

# API Documentation

## Base URL

```
/api/v1
```

## Authentication

쿠키 기반 세션 인증을 사용합니다.

| Cookie | Description |
|--------|-------------|
| `session_id` | 세션 식별자 (자동 생성, 7일 유효) |

---

## Common Response Format

### Success Response
```json
{
  "project": { ... },
  "templates": [ ... ],
  "roster": { ... },
  "persons": [ ... ]
}
```

### Error Response
```json
{
  "code": "ERROR_CODE",
  "message": "Error message",
  "details": {
    "field": ["validation error"]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Delete success) |
| 400 | Bad Request |
| 401 | Unauthorized (Session not found) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Endpoints

### Projects

#### POST /projects
새 프로젝트를 생성합니다.

**Request:**
```json
{
  "name": "내 명찰 프로젝트"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | max 255 chars | 프로젝트 이름 |

**Response:** `201 Created`
```json
{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "내 명찰 프로젝트",
    "status": "draft",
    "textConfig": null,
    "exportConfig": null,
    "createdAt": "2025-01-21T10:00:00",
    "updatedAt": "2025-01-21T10:00:00"
  }
}
```

**Note:** 세션 ID가 없으면 자동 생성되어 쿠키에 설정됩니다.

---

#### GET /projects/{projectId}
프로젝트 상세 정보를 조회합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Response:** `200 OK`
```json
{
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "내 명찰 프로젝트",
    "status": "draft",
    "textConfig": "{\"position\":{\"x\":50,\"y\":50},\"style\":{...}}",
    "exportConfig": "{\"paperSize\":\"A4\",\"layout\":\"2x2\",...}",
    "createdAt": "2025-01-21T10:00:00",
    "updatedAt": "2025-01-21T10:05:00"
  },
  "templates": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "fileName": "template1.png",
      "imageUrl": "https://s3.../template1.png",
      "thumbnailUrl": "https://s3.../thumb_template1.png",
      "role": "개발팀",
      "width": 400,
      "height": 240,
      "sortOrder": 0
    }
  ],
  "roster": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "fileName": "roster.xlsx",
    "columns": ["이름", "소속", "역할"],
    "nameColumn": "이름",
    "roleColumn": "역할",
    "totalCount": 10
  },
  "persons": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "홍길동",
      "role": "개발팀",
      "templateId": "660e8400-e29b-41d4-a716-446655440001"
    }
  ]
}
```

---

#### PUT /projects/{projectId}
프로젝트를 업데이트합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Request:**
```json
{
  "name": "수정된 프로젝트명",
  "textConfig": {
    "position": {
      "x": 50,
      "y": 50,
      "anchor": "center"
    },
    "style": {
      "fontFamily": "Pretendard",
      "fontSize": 36,
      "fontWeight": 700,
      "color": "#000000"
    }
  },
  "exportConfig": {
    "paperSize": "A4",
    "layout": "2x2",
    "margin": 10,
    "dpi": 300
  }
}
```

**Response:** `200 OK`
```json
{
  "project": { ... }
}
```

---

#### DELETE /projects/{projectId}
프로젝트를 삭제합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Response:** `204 No Content`

---

### Templates

#### POST /projects/{projectId}/templates
템플릿 이미지를 업로드합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| files | File[] | Yes | 이미지 파일들 (JPG, PNG) |

**Response:** `201 Created`
```json
{
  "templates": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "fileName": "template1.png",
      "imageUrl": "https://s3.../template1.png",
      "thumbnailUrl": null,
      "role": null,
      "width": 400,
      "height": 240,
      "sortOrder": 0
    }
  ]
}
```

---

#### PUT /projects/{projectId}/templates/{templateId}
템플릿 역할을 설정합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |
| templateId | UUID | 템플릿 ID |

**Request:**
```json
{
  "role": "개발팀"
}
```

**Response:** `200 OK`
```json
{
  "template": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "fileName": "template1.png",
    "imageUrl": "https://s3.../template1.png",
    "role": "개발팀",
    "width": 400,
    "height": 240,
    "sortOrder": 0
  }
}
```

---

#### DELETE /projects/{projectId}/templates/{templateId}
템플릿을 삭제합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |
| templateId | UUID | 템플릿 ID |

**Response:** `204 No Content`

---

### Roster

#### POST /projects/{projectId}/roster
명단 파일을 업로드합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Excel/CSV 파일 |

**Response:** `201 Created`
```json
{
  "roster": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "fileName": "roster.xlsx",
    "columns": ["이름", "소속", "역할"],
    "nameColumn": "이름",
    "roleColumn": "역할",
    "totalCount": 10
  },
  "persons": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "홍길동",
      "role": "개발팀",
      "templateId": null
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "name": "김철수",
      "role": "디자인팀",
      "templateId": null
    }
  ],
  "roleCounts": [
    { "role": "개발팀", "count": 5 },
    { "role": "디자인팀", "count": 3 },
    { "role": "기획팀", "count": 2 }
  ]
}
```

---

#### GET /projects/{projectId}/roster
명단 정보를 조회합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Response:** `200 OK`
```json
{
  "roster": { ... },
  "persons": [ ... ]
}
```

---

#### PUT /projects/{projectId}/roster/mapping
역할-템플릿 매핑을 설정합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Request:**
```json
{
  "mappings": [
    {
      "role": "개발팀",
      "templateId": "660e8400-e29b-41d4-a716-446655440001"
    },
    {
      "role": "디자인팀",
      "templateId": "660e8400-e29b-41d4-a716-446655440002"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "persons": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "홍길동",
      "role": "개발팀",
      "templateId": "660e8400-e29b-41d4-a716-446655440001"
    }
  ]
}
```

---

#### DELETE /projects/{projectId}/roster
명단을 삭제합니다.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | UUID | 프로젝트 ID |

**Response:** `204 No Content`

---

### Health Check

#### GET /health
서버 상태를 확인합니다.

**Response:** `200 OK`
```json
{
  "status": "UP"
}
```

---

## Data Types

### Project Status

| Value | Description |
|-------|-------------|
| `draft` | 초안 (편집 중) |
| `completed` | 완료 |

### Generation Status

| Value | Description |
|-------|-------------|
| `processing` | 생성 중 |
| `completed` | 완료 |
| `failed` | 실패 |

### Paper Size

| Value | Dimensions |
|-------|------------|
| `A4` | 210 x 297 mm |
| `Letter` | 216 x 279 mm |

### Layout

| Value | Grid | Description |
|-------|------|-------------|
| `2x2` | 2열 x 2행 | 페이지당 4개 |
| `2x3` | 2열 x 3행 | 페이지당 6개 |
| `3x3` | 3열 x 3행 | 페이지당 9개 |
| `2x4` | 2열 x 4행 | 페이지당 8개 |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `SESSION_NOT_FOUND` | 401 | 세션을 찾을 수 없음 |
| `PROJECT_NOT_FOUND` | 404 | 프로젝트를 찾을 수 없음 |
| `TEMPLATE_NOT_FOUND` | 404 | 템플릿을 찾을 수 없음 |
| `ROSTER_NOT_FOUND` | 404 | 명단을 찾을 수 없음 |
| `FILE_UPLOAD_ERROR` | 500 | 파일 업로드 실패 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

## Rate Limits

현재 Rate Limit은 적용되지 않았습니다.

---

## CORS Configuration

```java
allowedOrigins: ["http://localhost:3000", "https://nametag-pro.com"]
allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
allowedHeaders: ["*"]
allowCredentials: true
```
