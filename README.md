# Odoo HR 관리 시스템

Odoo HR 모듈을 활용한 현대적인 인사 관리 시스템입니다. Docker를 사용한 Odoo 백엔드와 Next.js 기반의 React 프론트엔드로 구성되어 있습니다.

## 🚀 주요 기능

### 인사 기본정보 관리
- **Employees 모듈** - 인사카드, 부서, 직무 등 관리
- **직원 목록 조회** - 모든 직원 정보 표시
- **직원 상세 정보** - 개인정보, 부서, 직무 등
- **부서 관리** - 부서 목록 및 구조 관리

### 근태 관리
- **Attendance 모듈** - 출근/퇴근 기록 자동화
- **Time Off 모듈** - 연차/휴가 관리
- **근태 정보 조회** - 출근 시간, 근무 시간 등

### 조직도/부서 관리
- **Department 모듈** - 사용자 정의 조직 트리
- **부서별 직원 관리** - 부서별 직원 수 표시

### 근로계약 관리
- **Contract 모듈** - 근로계약 정보 관리
- **계약 정보 조회** - 계약 기간, 급여 등

## 🛠 기술 스택

### 백엔드
- **Odoo 17.0** - ERP 시스템 (HR 모듈)
- **PostgreSQL** - 데이터베이스
- **Docker & Docker Compose** - 컨테이너화

### 프론트엔드
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **XML-RPC** - Odoo API 통신

## 📋 실행 환경 요구사항

- **Docker** (최신 버전)
- **Node.js** (18.x 이상)
- **npm** 또는 **yarn**

## 🚀 설치 및 실행

### 🚀 빠른 시작 (5분 설정)

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd odoo-hr-frontend

# 2. 백엔드 완전 초기화
cd backend
docker-compose down --volumes 2>/dev/null || true
docker system prune -f
docker-compose up -d
sleep 60

# 3. 데이터베이스 및 모듈 설치
docker-compose run --rm odoo odoo -i base --database=odoo-db --admin-passwd=admin
docker-compose run --rm odoo odoo -i hr,hr_attendance,hr_holidays,hr_skills,hr_org_chart,hr_contract --database=odoo-db

# 4. 프론트엔드 설정
cd ..
cp env.example .env.local
npm install
npm run dev
```

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd odoo-hr-frontend
```

### 2. 백엔드 실행 (Odoo)

#### 🚨 완전 초기화 (기존 데이터 삭제)
만약 Odoo 웹 인터페이스에서 초기 데이터베이스 설정이 아닌 로그인 화면이 나오거나 문제가 발생하는 경우:

```bash
# 1. 모든 Docker 컨테이너 및 볼륨 삭제
docker-compose down --volumes
docker system prune -f

# 2. Docker 이미지 캐시 삭제 (선택사항)
docker system prune -a -f

# 3. 백엔드 디렉토리로 이동
cd backend

# 4. Odoo 서버 완전 초기화
docker-compose up -d

# 5. 데이터베이스 초기화 대기 (약 1-2분)
echo "Odoo 서버 시작 중... 잠시 기다려주세요."
sleep 60

# 6. 기본 모듈 설치
docker-compose run --rm odoo odoo -i base --database=odoo-db --admin-passwd=admin

# 7. HR 모듈 설치
docker-compose run --rm odoo odoo -i hr,hr_attendance,hr_holidays,hr_skills,hr_org_chart,hr_contract --database=odoo-db

# 8. 로그 확인
docker-compose logs -f odoo
```

#### Docker Compose 설정 확인
```bash
cd backend
cat docker-compose.yml
```

#### Odoo 서버 시작 (일반 설치)
```bash
# Docker 컨테이너 시작
docker-compose up -d

# 서버 시작 대기 (약 30초)
echo "Odoo 서버 시작 중... 잠시 기다려주세요."
sleep 30

# 로그 확인
docker-compose logs -f odoo
```

#### 초기 데이터베이스 설정
```bash
# Odoo 데이터베이스 초기화
docker-compose run --rm odoo odoo -i base --database=odoo-db --admin-passwd=admin

# HR 모듈 설치
docker-compose run --rm odoo odoo -i hr,hr_attendance,hr_holidays,hr_skills,hr_org_chart,hr_contract --database=odoo-db
```

#### Odoo 웹 인터페이스 접속
- **URL**: `http://localhost:12000`
- **데이터베이스**: `odoo-db`
- **이메일**: `admin`
- **비밀번호**: `admin`

#### 초기 사용자 설정
1. `http://localhost:12000` 접속
2. 데이터베이스 선택: `odoo-db`
3. 관리자 계정으로 로그인:
   - **이메일**: `admin`
   - **비밀번호**: `admin`
4. 사용자 계정 생성:
   - **이메일**: `dudals896@gmail.com`
   - **비밀번호**: `qwer1234!`
   - **권한**: 관리자 또는 HR 관리자

#### 추가 모듈 설치 (선택사항)
브라우저에서 `http://localhost:12000` 접속 후 다음 모듈들을 설치:
- **Payroll** - 급여 계산 및 지급
- **Expenses** - 경비 관리
- **Recruitment** - 채용 관리
- **Timesheet** - 근무시간 관리
- **Appraisal** - 평가 관리
- **Approvals** - 승인 워크플로우

### 3. 프론트엔드 실행 (Next.js)

#### 환경변수 설정
```bash
# 프로젝트 루트로 이동
cd ..

# 환경변수 파일 생성
cp env.example .env.local

# 환경변수 편집 (필요시)
nano .env.local
```

#### 환경변수 설정 예시
```bash
# .env.local 파일 내용
NEXT_PUBLIC_ODOO_URL=http://localhost:12000
ODOO_DATABASE=odoo-db
ODOO_USERNAME=dudals896@gmail.com
ODOO_PASSWORD=qwer1234!
NEXT_PUBLIC_APP_NAME=Odoo HR 관리 시스템
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_DEBUG=true
```

#### 의존성 설치
```bash
# npm 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

#### 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev

# 또는 yarn 사용
yarn dev
```

#### 프론트엔드 접속
- **URL**: `http://localhost:3000`
- 자동으로 Odoo API에 연결됩니다

## 📁 프로젝트 구조

```
odoo-hr-frontend/
├── backend/
│   ├── docker-compose.yml          # Docker Compose 설정
│   ├── start-odoo.sh              # Odoo 시작 스크립트
│   └── odoo.conf                  # Odoo 설정 파일
├── src/
│   ├── app/
│   │   ├── api/odoo/              # Odoo API 프록시
│   │   │   ├── employees/         # 직원 관리 API
│   │   │   ├── departments/       # 부서 관리 API
│   │   │   ├── contracts/         # 근로계약 API
│   │   │   ├── holidays/          # 연차/휴가 API
│   │   │   ├── attendance/        # 근태 관리 API
│   │   │   └── payroll/           # 급여 관리 API
│   │   ├── layout.tsx             # 레이아웃 컴포넌트
│   │   └── page.tsx               # 메인 페이지
│   ├── components/
│   │   ├── EmployeeList.tsx       # 직원 목록 컴포넌트
│   │   ├── EmployeeDetail.tsx     # 직원 상세 컴포넌트
│   │   └── DepartmentList.tsx     # 부서 목록 컴포넌트
│   ├── lib/
│   │   └── odoo-api.ts            # Odoo API 클라이언트
│   └── types/
│       └── odoo.ts                # TypeScript 타입 정의
├── package.json                    # npm 의존성
├── tsconfig.json                   # TypeScript 설정
└── README.md                       # 프로젝트 문서
```

## 🔧 API 엔드포인트

### 직원 관리
- `GET /api/odoo/employees` - 직원 목록 조회
- `GET /api/odoo/employees/[id]` - 직원 상세 정보 조회

### 부서 관리
- `GET /api/odoo/departments` - 부서 목록 조회

### 근로계약 관리
- `GET /api/odoo/contracts?employeeId=[id]` - 근로계약 조회

### 연차/휴가 관리
- `GET /api/odoo/holidays?employeeId=[id]` - 연차/휴가 조회

### 근태 관리
- `GET /api/odoo/attendance?employeeId=[id]` - 근태 정보 조회

### 급여 관리
- `GET /api/odoo/payroll?employeeId=[id]` - 급여 정보 조회

## 🎯 주요 기능 설명

### 1. 통합 대시보드
- 총 직원 수, 부서 수, 출근 현황, 연차 현황 표시
- 실시간 데이터 업데이트

### 2. 직원 관리
- 직원 목록 조회 및 검색
- 직원 상세 정보 (개인정보, 부서, 직무)
- 근태 기록, 연차 정보, 급여 정보 탭

### 3. 부서 관리
- 부서 목록 및 구조 관리
- 부서별 직원 수 표시
- 조직도 시각화

### 4. 근태 관리
- 출근/퇴근 기록 자동화
- 근무 시간 계산
- 연차/휴가 신청 및 관리

## 🔍 문제 해결

### Odoo 서버 연결 문제
```bash
# Docker 컨테이너 상태 확인
docker-compose ps

# Odoo 로그 확인
docker-compose logs odoo

# 컨테이너 재시작
docker-compose restart odoo

# 포트 충돌 확인
lsof -i :12000
```

### 데이터베이스 초기화 문제
```bash
# 모든 데이터 삭제 후 재시작
docker-compose down --volumes
docker system prune -f
docker-compose up -d

# 데이터베이스 수동 초기화
docker-compose run --rm odoo odoo -i base --database=odoo-db --admin-passwd=admin
```

### 로그인 화면이 나오는 경우
만약 `http://localhost:12000`에 접속했을 때 초기 데이터베이스 설정이 아닌 로그인 화면이 나오는 경우:

1. **완전 초기화 실행**:
```bash
cd backend
docker-compose down --volumes
docker system prune -f
docker-compose up -d
sleep 60
docker-compose run --rm odoo odoo -i base --database=odoo-db --admin-passwd=admin
```

2. **브라우저 캐시 삭제**:
   - 브라우저의 캐시 및 쿠키 삭제
   - 시크릿 모드로 접속 테스트

3. **다른 포트 사용**:
   - `docker-compose.yml`에서 포트 변경 (예: 12001:8069)
   - 환경변수 `NEXT_PUBLIC_ODOO_URL`도 함께 변경

### 프론트엔드 API 연결 문제
```bash
# API 엔드포인트 테스트
curl http://localhost:3000/api/odoo/test
curl http://localhost:3000/api/odoo/employees

# 환경변수 확인
cat .env.local

# Next.js 서버 재시작
npm run dev
```

### 모듈 설치 문제
```bash
# HR 모듈 재설치
docker-compose run --rm odoo odoo -i hr,hr_attendance,hr_holidays,hr_skills,hr_org_chart,hr_contract --database=odoo-db

# 특정 모듈만 설치
docker-compose run --rm odoo odoo -i hr_payslip --database=odoo-db
```

## 📸 Vibe 툴 사용 스크린샷

### Cursor Pro Vibe 기능 활용
- **코드 생성**: TypeScript 인터페이스 및 API 엔드포인트 자동 생성
- **컴포넌트 개발**: React 컴포넌트 구조 및 스타일링 자동 완성
- **API 통합**: XML-RPC 통신 로직 자동 구현
- **타입 안전성**: TypeScript 타입 정의 자동 생성

### 주요 Vibe 스크립트
```typescript
// 직원 관리 API 생성
// Vibe: "Odoo XML-RPC API for employee management"

// 부서 관리 컴포넌트 생성  
// Vibe: "React component for department management with Tailwind CSS"

// TypeScript 타입 정의
// Vibe: "TypeScript interfaces for Odoo HR modules"
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Odoo HR 관리 시스템** - 현대적인 인사 관리 솔루션 🚀
