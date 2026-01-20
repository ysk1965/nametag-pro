# NameTag Pro

> 명단만 있으면 명찰 완성 - 단체 행사용 명찰 자동 생성 서비스

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (State Management)
- TanStack Query
- Konva.js (Canvas)

### Backend
- Spring Boot 3.2
- Java 17
- PostgreSQL 15
- Redis 7

### Infrastructure
- AWS (EC2, S3, RDS, ElastiCache, CloudFront)
- Terraform
- GitHub Actions

## Project Structure

```
nametag-pro/
├── frontend/          # Next.js 14 앱
├── backend/           # Spring Boot 앱
├── infrastructure/    # AWS Terraform
└── docker-compose.yml # 로컬 개발 환경
```

## Getting Started

### Prerequisites
- Node.js 20+
- Java 17+
- Docker & Docker Compose

### Local Development

1. Start databases:
```bash
docker-compose up -d
```

2. Run backend:
```bash
cd backend
./gradlew bootRun
```

3. Run frontend:
```bash
cd frontend
npm install
npm run dev
```

## License

Private - All rights reserved
