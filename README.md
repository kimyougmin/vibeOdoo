# Odoo HR 관리 시스템

Odoo HR 모듈을 활용한 현대적인 인사 관리 시스템입니다. Docker를 사용한 Odoo 백엔드와 Next.js 기반의 React 프론트엔드로 구성되어 있습니다.

## 🚀 주요 기능

### 인사 기본정보 관리
- **Employees 모듈** - 인사카드, 부서, 직무 등 관리
- **직원 목록 조회** - 모든 직원 정보 표시
- **직원 상세 정보** - 개인정보, 부서, 직무 등
- **부서 관리** - 부서 목록 및 구조 관리
- **직원 CRUD 기능** - 직원 생성, 수정, 삭제
- **부서 CRUD 기능** - 부서 생성, 수정, 삭제

### 근태 관리
- **Attendance 모듈** - 출근/퇴근 기록 자동화
- **Time Off 모듈** - 연차/휴가 관리
- **근태 정보 조회** - 출근 시간, 근무 시간 등

### 조직도/부서 관리
- **Department 모듈** - 사용자 정의 조직 트리
- **부서별 직원 관리** - 부서별 직원 수 표시
- **조직도 CRUD 기능** - 조직 생성, 수정, 삭제
- **직원 배치 기능** - 부서에 직원 배치
- **조직도 통계** - 총 직원 수, 성별 분포, 평균 급여

### 근로계약 관리
- **Contract 모듈** - 근로계약 정보 관리
- **계약 정보 조회** - 계약 기간, 급여 등
- **급여 CRUD 기능** - 급여 계약 생성, 수정, 삭제

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

## 🚀 설치 및 실행git 

#### Git Clone 실행
```bash
git clone https://github.com/kimyougmin/vibeOdoo.git
cd vibeOdoo
```

#### Docker Compose 설정 확인
```bash
cd backend
cat docker-compose.yml
```

#### Odoo 서버 시작 (일반 설치)
```bash
# Docker 컨테이너 시작
docker-compose down -v
docker volume prune -f
docker-compose up --build


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
ODOO_USERNAME=admin
ODOO_PASSWORD=admin
NEXT_PUBLIC_APP_NAME=Odoo HR 관리 시스템
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_BASE_URL=/api/odoo
NEXT_PUBLIC_DEBUG=true
```

#### 환경변수 파일 생성
```bash
# 환경변수 파일 생성
cp env.example .env.local

# 또는 직접 생성
touch .env.local
```

#### dotenv 설정 확인
프로젝트는 dotenv를 사용하여 .env.local 파일을 자동으로 로드합니다:
- ✅ **Next.js 설정**: `next.config.ts`에서 dotenv 설정
- ✅ **API 라우트**: `src/lib/env.ts`에서 환경변수 로딩
- ✅ **환경변수 검증**: 필수 환경변수 자동 검증

#### 환경변수 필수 설정
다음 환경변수들이 반드시 설정되어야 합니다:
- `NEXT_PUBLIC_ODOO_URL`: Odoo 서버 URL
- `ODOO_DATABASE`: Odoo 데이터베이스 이름
- `ODOO_USERNAME`: Odoo 사용자명
- `ODOO_PASSWORD`: Odoo 비밀번호
- `NEXT_PUBLIC_API_BASE_URL`: API 기본 URL
- `NEXT_PUBLIC_API_TIMEOUT`: API 타임아웃 (선택사항)

#### 로그인 문제 해결
만약 로그인에 문제가 있는 경우:

1. **환경변수 확인**:
```bash
# .env.local 파일이 존재하는지 확인
ls -la .env.local

# 환경변수 내용 확인
cat .env.local
```

2. **Odoo 사용자 계정 확인**:
```bash
# Odoo 웹 인터페이스에서 사용자 계정 생성
# 1. http://localhost:12000 접속
# 2. 데이터베이스: odoo-db 선택
# 3. 관리자 계정으로 로그인:
#    - 이메일: admin
#    - 비밀번호: admin
# 4. 사용자 계정 생성:
#    - 이메일: admin (또는 원하는 이메일)
#    - 비밀번호: admin (또는 원하는 비밀번호)
#    - 권한: 관리자 또는 HR 관리자
```

3. **환경변수 업데이트**:
```bash
# .env.local 파일 편집
nano .env.local

# 사용자 계정에 맞게 수정
ODOO_USERNAME=admin
ODOO_PASSWORD=admin
```

4. **Next.js 서버 재시작**:
```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
npm run dev
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

#### CRUD 기능 사용법

**1. 직원 관리**
- **직원 목록**: 사이드바에서 "직원 관리" 선택
- **새 직원 추가**: "새 직원 추가" 버튼 클릭
- **직원 수정**: 직원 목록에서 "수정" 버튼 클릭
- **직원 삭제**: 직원 목록에서 "삭제" 버튼 클릭

**2. 부서 관리**
- **부서 목록**: 사이드바에서 "부서 관리" 선택
- **새 부서 추가**: "새 부서 추가" 버튼 클릭
- **부서 수정**: 부서 목록에서 "수정" 버튼 클릭
- **부서 삭제**: 부서 목록에서 "삭제" 버튼 클릭

**3. 조직도 관리**
- **조직도 보기**: 사이드바에서 "조직도 관리" 선택
- **새 부서 생성**: "새 부서 생성" 버튼 클릭
- **부서 상세보기**: 각 부서의 "상세보기" 버튼 클릭
- **직원 배치**: 부서 생성/수정 시 상위 부서 설정
- **조직도 통계**: 총 직원 수, 성별 분포, 평균 급여 확인

**4. 급여 관리**
- **급여 목록**: 사이드바에서 "급여 관리" 선택
- **새 급여 계약**: "새 급여 계약" 버튼 클릭
- **급여 수정**: 급여 목록에서 "수정" 버튼 클릭
- **급여 삭제**: 급여 목록에서 "삭제" 버튼 클릭

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
- `POST /api/odoo/employees` - 직원 생성
- `PUT /api/odoo/employees/[id]` - 직원 수정
- `DELETE /api/odoo/employees/[id]` - 직원 삭제

### 부서 관리
- `GET /api/odoo/departments` - 부서 목록 조회
- `POST /api/odoo/departments` - 부서 생성
- `PUT /api/odoo/departments/[id]` - 부서 수정
- `DELETE /api/odoo/departments/[id]` - 부서 삭제

### 근로계약 관리
- `GET /api/odoo/contracts?employeeId=[id]` - 근로계약 조회

### 연차/휴가 관리
- `GET /api/odoo/holidays?employeeId=[id]` - 연차/휴가 조회

### 근태 관리
- `GET /api/odoo/attendance?employeeId=[id]` - 근태 정보 조회

### 급여 관리
- `GET /api/odoo/payroll?employeeId=[id]` - 급여 정보 조회
- `POST /api/odoo/payroll` - 급여 계약 생성
- `PUT /api/odoo/payroll/[id]` - 급여 계약 수정
- `DELETE /api/odoo/payroll/[id]` - 급여 계약 삭제

### 통계 및 대시보드
- `GET /api/odoo/stats` - 대시보드 통계 조회
- `GET /api/odoo/jobs` - 직무 목록 조회

## 🎯 주요 기능 설명

### 1. 통합 대시보드
- 총 직원 수, 부서 수, 출근 현황, 연차 현황 표시
- 실시간 데이터 업데이트
- 조직도 통계 (총 직원 수, 성별 분포, 평균 급여)

### 2. 직원 관리
- 직원 목록 조회 및 검색
- 직원 상세 정보 (개인정보, 부서, 직무)
- 근태 기록, 연차 정보, 급여 정보 탭
- **직원 CRUD 기능**: 생성, 수정, 삭제
- **직원 배치**: 부서에 직원 배치

### 3. 부서 관리
- 부서 목록 및 구조 관리
- 부서별 직원 수 표시
- 조직도 시각화
- **부서 CRUD 기능**: 생성, 수정, 삭제
- **부서 계층 구조**: 상위 부서 설정

### 4. 조직도 관리
- 조직도 트리 구조 표시
- 부서별 소속 직원 목록
- **조직도 CRUD 기능**: 부서 생성, 수정, 삭제
- **직원 배치 기능**: 부서에 직원 배치
- **조직도 통계**: 총 직원 수, 성별 분포, 평균 급여

### 5. 근태 관리
- 출근/퇴근 기록 자동화
- 근무 시간 계산
- 연차/휴가 신청 및 관리

### 6. 급여 관리
- 급여 계약 정보 관리
- 급여 구조 및 계산식 구성
- **급여 CRUD 기능**: 급여 계약 생성, 수정, 삭제

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

### 환경변수 문제
```bash
# 환경변수 파일이 없는 경우
cp env.example .env.local

# 환경변수 내용 확인
cat .env.local

# 필수 환경변수 확인
echo "NEXT_PUBLIC_ODOO_URL: $NEXT_PUBLIC_ODOO_URL"
echo "ODOO_DATABASE: $ODOO_DATABASE"
echo "ODOO_USERNAME: $ODOO_USERNAME"
echo "ODOO_PASSWORD: $ODOO_PASSWORD"
```

### dotenv 로딩 문제
```bash
# dotenv 패키지 설치 확인
npm list dotenv

# .env.local 파일 경로 확인
ls -la .env.local

# Next.js 서버 재시작
npm run dev

# 환경변수 로딩 테스트
curl http://localhost:3000/api/odoo/test
```

### API 연결 문제

#### CRUD 기능 문제 해결

**1. 부서 추가 기능이 작동하지 않는 경우**
```bash
# 환경변수 확인
cat .env.local

# Odoo 인증 테스트
curl -s http://localhost:12000/web/session/authenticate \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{"db":"odoo","login":"admin","password":"admin"}}'

# 부서 API 테스트
curl -s http://localhost:3000/api/odoo/departments

# 부서 생성 테스트
curl -X POST http://localhost:3000/api/odoo/departments \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트팀","complete_name":"테스트팀"}'
```

**2. 직원 관리 기능 문제**
```bash
# 직원 API 테스트
curl -s http://localhost:3000/api/odoo/employees

# 직원 생성 테스트
curl -X POST http://localhost:3000/api/odoo/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","work_email":"hong@example.com"}'
```

**3. 조직도 관리 문제**
```bash
# 조직도 통계 API 테스트
curl -s http://localhost:3000/api/odoo/stats

# 직무 목록 API 테스트
curl -s http://localhost:3000/api/odoo/jobs
```

**4. 데이터베이스 문제**
```bash
# Odoo에서 직접 데이터 확인
curl -X POST http://localhost:12000/xmlrpc/2/object \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?><methodCall><methodName>execute</methodName><params><param><value><string>odoo</string></value></param><param><value><int>2</int></value></param><param><value><string>admin</string></value></param><param><value><string>hr.department</string></value></param><param><value><string>search_read</string></value></param><param><value><array><data></data></array></value></param><param><value><array><data><value><string>id</string></value><value><string>name</string></value><value><string>complete_name</string></value></data></array></value></param></params></methodCall>'
```

**5. 환경변수 문제 해결**
```bash
# .env.local 파일 재생성
rm .env.local
cp env.example .env.local

# 환경변수 수정
sed -i '' 's/NEXT_PUBLIC_ODOO_USERNAME=wkqk896@naver.com/NEXT_PUBLIC_ODOO_USERNAME=admin/' .env.local
sed -i '' 's/NEXT_PUBLIC_ODOO_PASSWORD=qwer1234!/NEXT_PUBLIC_ODOO_PASSWORD=admin/' .env.local

# Next.js 서버 재시작
npm run dev
```