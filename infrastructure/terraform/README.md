# NameTag Pro - AWS Infrastructure (Terraform)

## Prerequisites

1. **AWS CLI 설정**
   ```bash
   aws configure
   # AWS Access Key ID, Secret Access Key, Region (ap-northeast-2) 입력
   ```

2. **Terraform 설치 확인**
   ```bash
   terraform --version  # v1.0 이상 필요
   ```

3. **EC2 Key Pair 생성** (선택사항, SSH 접속용)
   - AWS Console > EC2 > Key Pairs > Create key pair
   - 이름: `nametag-pro-key` (예시)
   - 파일 다운로드 후 안전하게 보관

---

## Quick Start

### Step 1: 변수 파일 생성

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` 파일을 열어 필수 값 수정:
```hcl
db_username = "admin"
db_password = "YourSecurePassword123!"  # 반드시 변경!
ec2_key_pair_name = "your-key-pair"     # 생성한 키페어 이름
```

### Step 2: Terraform 초기화

```bash
terraform init
```

### Step 3: 실행 계획 확인

```bash
terraform plan
```

출력 내용을 검토하여 생성될 리소스 확인

### Step 4: 인프라 생성

```bash
terraform apply
```

`yes` 입력하여 실행 (약 10-15분 소요)

### Step 5: 출력값 확인

```bash
terraform output
```

중요한 출력값:
- `api_public_ip`: Backend API 서버 IP
- `ecr_repository_url`: Docker 이미지 저장소 URL
- `cloudfront_domain_name`: Frontend URL
- `github_actions_access_key_id`: GitHub Actions용 Access Key

Secret 값 확인:
```bash
terraform output -raw github_actions_secret_access_key
```

---

## GitHub Secrets 설정

GitHub 저장소 > Settings > Secrets and variables > Actions > New repository secret

### 필수 Secrets

| Secret Name | 값 | 설명 |
|------------|-----|------|
| `AWS_ACCESS_KEY_ID` | terraform output 참조 | GitHub Actions IAM 사용자 |
| `AWS_SECRET_ACCESS_KEY` | terraform output 참조 | GitHub Actions IAM 사용자 |
| `ECR_REGISTRY` | `{account_id}.dkr.ecr.ap-northeast-2.amazonaws.com` | ECR 레지스트리 URL |
| `ECR_REPOSITORY_NAME` | `nametag-pro-api` | ECR 레포지토리 이름 |
| `EC2_HOST` | terraform output `api_public_ip` | EC2 퍼블릭 IP |
| `EC2_SSH_KEY` | 다운로드한 .pem 파일 내용 | SSH 접속용 |
| `DATABASE_URL` | `jdbc:postgresql://{rds_endpoint}/nametagpro` | RDS 연결 URL |
| `REDIS_URL` | `redis://{redis_endpoint}:6379` | Redis 연결 URL |
| `AWS_S3_BUCKET` | terraform output `uploads_bucket_name` | S3 버킷 이름 |
| `JWT_SECRET` | 32자 이상의 랜덤 문자열 | JWT 서명 키 |
| `FRONTEND_BUCKET_NAME` | terraform output `frontend_bucket_name` | Frontend S3 버킷 |
| `CLOUDFRONT_DISTRIBUTION_ID` | terraform output 참조 | CloudFront ID |
| `CLOUDFRONT_DOMAIN_NAME` | terraform output 참조 | CloudFront 도메인 |
| `NEXT_PUBLIC_API_URL` | `https://{cloudfront_domain}/api/v1` | API URL |

### Secrets 설정 스크립트

```bash
# GitHub CLI가 설치되어 있다면:
gh secret set AWS_ACCESS_KEY_ID --body "$(terraform output -raw github_actions_access_key_id)"
gh secret set AWS_SECRET_ACCESS_KEY --body "$(terraform output -raw github_actions_secret_access_key)"
gh secret set ECR_REGISTRY --body "$(terraform output -raw ecr_registry_id).dkr.ecr.ap-northeast-2.amazonaws.com"
gh secret set ECR_REPOSITORY_NAME --body "nametag-pro-api"
gh secret set EC2_HOST --body "$(terraform output -raw api_public_ip)"
gh secret set DATABASE_URL --body "jdbc:postgresql://$(terraform output -raw rds_endpoint)/nametagpro"
gh secret set REDIS_URL --body "redis://$(terraform output -raw redis_endpoint):6379"
gh secret set AWS_S3_BUCKET --body "$(terraform output -raw uploads_bucket_name)"
gh secret set FRONTEND_BUCKET_NAME --body "$(terraform output -raw frontend_bucket_name)"
gh secret set CLOUDFRONT_DISTRIBUTION_ID --body "$(terraform output -raw cloudfront_distribution_id)"
gh secret set CLOUDFRONT_DOMAIN_NAME --body "$(terraform output -raw cloudfront_domain_name)"
gh secret set NEXT_PUBLIC_API_URL --body "https://$(terraform output -raw cloudfront_domain_name)/api/v1"
```

수동으로 설정해야 하는 것:
```bash
gh secret set EC2_SSH_KEY < ~/.ssh/nametag-pro-key.pem
gh secret set JWT_SECRET --body "$(openssl rand -base64 32)"
```

---

## 생성되는 AWS 리소스

### 네트워크
- VPC (10.0.0.0/16)
- Public Subnets (2개)
- Private Subnets (2개)
- NAT Gateway
- Internet Gateway

### 컴퓨팅
- EC2 Instance (Backend API)
- Elastic IP

### 데이터베이스
- RDS PostgreSQL 15
- ElastiCache Redis 7

### 스토리지
- S3 Bucket (uploads) - 파일 업로드용
- S3 Bucket (outputs) - 생성된 PDF 저장 (7일 후 자동 삭제)
- S3 Bucket (frontend) - 정적 웹사이트 호스팅

### CDN
- CloudFront Distribution

### 컨테이너 레지스트리
- ECR Repository

### IAM
- EC2 Instance Role (S3 접근용)
- GitHub Actions User (ECR, S3, CloudFront 접근용)

---

## 예상 비용 (월간, 서울 리전)

| 리소스 | 사양 | 예상 비용 |
|-------|------|----------|
| EC2 | t3.small | ~$15 |
| RDS | db.t3.small | ~$26 |
| ElastiCache | cache.t3.micro | ~$12 |
| NAT Gateway | - | ~$32 |
| S3 + CloudFront | - | ~$5 |
| **합계** | | **~$90/월** |

### 비용 절감 팁
- 개발 환경: `single_nat_gateway = true` (기본값)
- RDS: `db.t3.micro` 사용 ($13/월)
- EC2: `t3.micro` 사용 ($8/월)

---

## 인프라 삭제

```bash
terraform destroy
```

**주의**: 모든 데이터가 삭제됩니다. 프로덕션 환경에서는 RDS 스냅샷을 먼저 생성하세요.

---

## 트러블슈팅

### terraform init 실패
```bash
# 캐시 삭제 후 재시도
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### ECR 로그인 실패
```bash
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin {account_id}.dkr.ecr.ap-northeast-2.amazonaws.com
```

### EC2 접속
```bash
ssh -i ~/.ssh/nametag-pro-key.pem ec2-user@{api_public_ip}
```

### 로그 확인
```bash
# EC2에서 Docker 로그 확인
docker logs nametag-api -f
```
