# 짜장면 vs 짬뽕 투표 시스템 개발 로그

## 프로젝트 개요
- **프로젝트명**: Noodle Poll (짜장면 vs 짬뽕 투표)
- **기술 스택**: Next.js 16.1.1 (App Router), TypeScript, Tailwind CSS, Supabase
- **배포**: Vercel
- **저장소**: https://github.com/MinhoiKoo/Noodle-poll.git

---

## 완료된 Milestone

### ✅ Milestone 0: 프로젝트 셋업 & 기본 라우팅
**완료일**: 2025-12-30

#### 구현 내용
- Next.js 프로젝트 생성 (App Router)
- 기본 라우트 생성:
  - `app/vote/page.tsx` - 투표 페이지
  - `app/result/page.tsx` - 결과 페이지
- Tailwind CSS 기본 UI 설정
- 개발 서버 실행 확인 (http://localhost:3000)

#### 완료 기준
- [x] `/vote`, `/result` 페이지 정상 렌더링
- [x] `npm run dev`로 로컬 실행 가능

---

### ✅ Milestone 1: Supabase 데이터베이스 설정
**완료일**: 2025-12-30

#### 구현 내용
- **Supabase 클라이언트 설정**:
  - `@supabase/supabase-js` 및 `@supabase/ssr` 패키지 설치
  - `lib/supabase.ts` - 브라우저용 클라이언트
  - `lib/supabase-server.ts` - 서버용 클라이언트 (SSR)

- **데이터베이스 스키마** (`supabase/schema.sql`):
  ```sql
  create table votes (
    choice text primary key check (choice in ('jjajang', 'jjamppong')),
    count integer not null default 0,
    updated_at timestamp with time zone default now() not null
  );

  create function increment_vote(vote_choice text) returns void;
  ```

- **Store 유틸리티** (`lib/store.ts`):
  - `read()`: 투표 결과 조회
  - `increment(choice)`: 투표 수 증가 (원자적)
  - `isValidChoice()`: 선택값 검증

#### 파일 구조
```
lib/
├── supabase.ts          # 브라우저 클라이언트
├── supabase-server.ts   # 서버 클라이언트
└── store.ts             # 투표 데이터 관리

supabase/
├── schema.sql           # DB 스키마
└── README.md            # 설정 가이드

.env.local.example       # 환경 변수 템플릿
```

#### 완료 기준
- [x] Supabase 클라이언트 연결 확인
- [x] read/increment 함수 구현
- [x] 새로고침 시 데이터 유지
- [x] 서버 재시작 후에도 데이터 유지

---

### ✅ Milestone 2: API 구현
**완료일**: 2025-12-30

#### 구현 내용
- **POST /api/vote** (`app/api/vote/route.ts`):
  - Request body validation
  - 선택값 검증 (jjajang | jjamppong)
  - Supabase RPC 호출로 원자적 업데이트
  - 쿨다운 기능 (60초) - Milestone 6에서 추가
  - 에러 핸들링 (400, 429, 500)

- **GET /api/result** (`app/api/result/route.ts`):
  - 투표 결과 조회
  - 캐시 비활성화 헤더 설정
  - 에러 핸들링

#### API 스펙
```typescript
// POST /api/vote
Request: { choice: "jjajang" | "jjamppong" }
Response: { ok: true } | { ok: false, message: string, remainingSeconds?: number }

// GET /api/result
Response: {
  jjajang: number,
  jjamppong: number,
  total: number,
  updatedAt: string
}
```

#### 문서
- `docs/API.md` - 상세 API 문서
- `scripts/test-api.ps1` - PowerShell 테스트 스크립트
- `scripts/test-api.sh` - Bash 테스트 스크립트

#### 완료 기준
- [x] POST /api/vote 구현
- [x] GET /api/result 구현
- [x] Request validation
- [x] 적절한 HTTP 상태 코드
- [x] 테스트 스크립트 작성

---

### ✅ Milestone 3: 투표 페이지 구현
**완료일**: 2025-12-30

#### 구현 내용
**파일**: `app/vote/page.tsx` (클라이언트 컴포넌트)

- **UI 컴포넌트**:
  - 라디오 버튼으로 단일 선택 (짜장면 🍜 / 짬뽕 🍲)
  - 선택 시 시각적 피드백 (테두리 색상, 배경 강조)
  - 호버 효과

- **폼 처리**:
  - `useState`로 선택값, 제출 상태, 에러 관리
  - 클라이언트 사이드 검증
  - `POST /api/vote` API 호출
  - 성공 시 `useRouter`로 `/result`로 리다이렉트

- **사용자 피드백**:
  - 로딩 상태 (스피너 애니메이션)
  - 에러 메시지 (빨간 배경 강조)
  - 쿨다운 타이머 (60초 카운트다운) - Milestone 6에서 추가

- **디자인**:
  - 그라디언트 배경 (주황→빨강)
  - 카드 스타일 레이아웃
  - 반응형 디자인

#### 완료 기준
- [x] 라디오/버튼으로 선택 UI
- [x] 선택값 검증
- [x] POST /api/vote 호출
- [x] 성공 시 /result로 이동
- [x] 에러 메시지 표시

---

### ✅ Milestone 4: 결과 페이지 구현
**완료일**: 2025-12-30

#### 구현 내용
**파일**: `app/result/page.tsx` (클라이언트 컴포넌트)

- **데이터 조회**:
  - `useEffect`로 페이지 로드 시 `GET /api/result` 호출
  - 로딩/에러/성공 상태 관리

- **결과 표시**:
  - 짜장면/짬뽕 각각의 득표 수
  - 승률(%) 계산 및 표시
  - 프로그레스 바 (그라디언트 애니메이션)
  - 우승자 표시 (👑 아이콘 + 강조 스타일)
  - 무승부 감지

- **UI 요소**:
  - 로딩 상태: 스피너
  - 에러 상태: 에러 메시지 + "다시 시도" 버튼
  - "다시 투표하기" 링크 (`Link` 컴포넌트)
  - "수동 새로고침" 버튼
  - 마지막 업데이트 시간 (한국 시간)

#### 완료 기준
- [x] GET /api/result 호출
- [x] 로딩/에러 상태 처리
- [x] 결과 표시 (득표수, 승률, 총계)
- [x] 새로고침해도 결과 유지
- [x] "다시 투표하기" 링크

---

### ✅ Milestone 5: 실시간 결과 반영
**완료일**: 2025-12-30

#### 구현 내용
**파일**: `app/result/page.tsx` (업데이트)

- **폴링 메커니즘**:
  - 3초마다 `GET /api/result` 자동 호출
  - `setInterval` + `useEffect` 클린업

- **자동 갱신 제어**:
  - ON/OFF 토글 버튼
  - 상태별 시각적 피드백:
    - 켜짐: 초록 배경 + 점멸 애니메이션 (●)
    - 꺼짐: 회색 배경

- **최적화**:
  - 백그라운드 갱신 플래그 (`isBackgroundRefresh`)
  - 자동 갱신: 로딩 스피너 미표시
  - 수동 갱신: 로딩 스피너 표시
  - 메모리 누수 방지 (클린업 함수)

- **시각적 인디케이터**:
  - 갱신 중 스피너 아이콘
  - 실시간 갱신 상태 표시
  - 마지막 업데이트 시간

#### 문서
- `docs/REALTIME.md` - 실시간 갱신 가이드
  - 폴링 vs Supabase Realtime 비교
  - 성능 고려사항
  - 테스트 시나리오
  - 향후 개선 방안

#### 완료 기준
- [x] 폴링 메커니즘 (3초 주기)
- [x] interval-based GET /api/result
- [x] 백그라운드 갱신 최적화
- [x] 자동 갱신 ON/OFF 토글
- [x] 시각적 인디케이터

---

### ✅ Milestone 6: 어뷰징 방지
**완료일**: 2025-12-30 (사용자가 직접 구현)

#### 구현 내용
**파일**: `app/api/vote/route.ts`, `app/vote/page.tsx` (업데이트)

- **쿨다운 메커니즘**:
  - 쿠키 기반 투표 제한 (60초)
  - `lastVotedAt` 쿠키에 마지막 투표 시간 기록
  - 쿨다운 시간 내 재투표 시 429 상태 코드 반환

- **서버 측 검증** (`app/api/vote/route.ts`):
  ```typescript
  const VOTE_COOLDOWN_MS = 60 * 1000 // 60초

  // 1. 쿨다운 검사
  const lastVotedAt = request.cookies.get('lastVotedAt')?.value
  if (lastVotedAt) {
    const timeSinceLastVote = currentTime - lastVoteTime
    if (timeSinceLastVote < VOTE_COOLDOWN_MS) {
      return NextResponse.json({ ok: false, remainingSeconds }, { status: 429 })
    }
  }

  // 2. 쿠키 설정
  response.cookies.set('lastVotedAt', Date.now().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: VOTE_COOLDOWN_MS / 1000
  })
  ```

- **클라이언트 측 피드백** (`app/vote/page.tsx`):
  - 429 에러 처리
  - 남은 시간 카운트다운 타이머
  - 원형 프로그레스 바 애니메이션
  - 노란색 경고 스타일

#### 보안 특징
- `httpOnly`: JavaScript 접근 차단
- `secure`: HTTPS에서만 전송 (프로덕션)
- `sameSite: 'lax'`: CSRF 방지
- 서버 측 검증으로 우회 방지

#### 완료 기준
- [x] 쿠키 기반 쿨다운 (60초)
- [x] 429 상태 코드 반환
- [x] 클라이언트 에러 메시지
- [x] 카운트다운 타이머 UI

---

## 현재 상태

### 📋 Milestone 7: 배포 준비 (진행 중)

#### 진행 상황
- [x] Git 저장소 연결 (https://github.com/MinhoiKoo/Noodle-poll.git)
- [x] 초기 Push 완료
- [ ] Production 빌드 테스트
- [ ] 환경 변수 준비
- [ ] README 작성
- [ ] Vercel 배포
- [ ] 배포 URL 확인

#### 환경 변수 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mihgsz ahobxxaawiwori.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 프로젝트 구조

```
noodle-poll/
├── app/
│   ├── api/
│   │   ├── vote/
│   │   │   └── route.ts         # POST /api/vote (쿨다운 포함)
│   │   └── result/
│   │       └── route.ts         # GET /api/result
│   ├── vote/
│   │   └── page.tsx             # 투표 페이지 (쿨다운 UI 포함)
│   └── result/
│       └── page.tsx             # 결과 페이지 (실시간 갱신)
├── lib/
│   ├── supabase.ts              # 브라우저 클라이언트
│   ├── supabase-server.ts       # 서버 클라이언트
│   └── store.ts                 # 투표 데이터 관리
├── supabase/
│   ├── schema.sql               # DB 스키마
│   └── README.md                # Supabase 설정 가이드
├── docs/
│   ├── API.md                   # API 문서
│   └── REALTIME.md              # 실시간 갱신 가이드
├── scripts/
│   ├── test-api.ps1             # PowerShell 테스트
│   └── test-api.sh              # Bash 테스트
├── PLAN.md                      # 프로젝트 계획
├── .env.local                   # 환경 변수 (Git 제외)
└── .env.local.example           # 환경 변수 템플릿
```

---

## 기술 스택 상세

### Frontend
- **Framework**: Next.js 16.1.1 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router, useRouter

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **ORM**: Supabase JS Client
- **Authentication**: None (쿠키 기반 쿨다운만)

### DevOps
- **Version Control**: Git + GitHub
- **Deployment**: Vercel (예정)
- **Package Manager**: npm

---

## 주요 기능

### ✅ 구현 완료
1. **투표 시스템**
   - 짜장면/짬뽕 선택
   - 서버 저장 (Supabase)
   - 새로고침 유지

2. **결과 표시**
   - 득표 수 표시
   - 승률(%) 계산
   - 프로그레스 바
   - 우승자 표시

3. **실시간 갱신**
   - 3초 폴링
   - ON/OFF 토글
   - 백그라운드 갱신

4. **어뷰징 방지**
   - 60초 쿨다운
   - 쿠키 기반
   - 카운트다운 UI

5. **사용자 경험**
   - 로딩 상태
   - 에러 핸들링
   - 반응형 디자인
   - 애니메이션

### 🔄 향후 개선 가능 항목
1. Supabase Realtime 적용
2. SWR/React Query 도입
3. IP 기반 어뷰징 방지
4. 다국어 지원
5. 소셜 공유 기능
6. 통계 대시보드

---

## 테스트 시나리오

### 단일 브라우저 테스트
1. `/vote` 접속 → 선택 → 투표 → `/result` 자동 이동
2. 60초 이내 재투표 → 쿨다운 타이머 표시
3. `/result` 자동 갱신 (3초) 확인
4. 자동 갱신 토글 ON/OFF 테스트

### 다중 브라우저 테스트
1. 브라우저 A: `/result` 열기 (실시간 갱신 ON)
2. 브라우저 B: `/vote`에서 투표
3. 브라우저 A: 3초 이내 자동 갱신 확인

### API 테스트
```powershell
# PowerShell
.\scripts\test-api.ps1

# 또는 직접 호출
Invoke-RestMethod -Uri "http://localhost:3000/api/result"
```

---

## 배포 체크리스트

### Vercel 배포 전
- [ ] Production 빌드 테스트 (`npm run build`)
- [ ] 환경 변수 확인
- [ ] Supabase 프로덕션 설정
- [ ] README.md 작성
- [ ] .gitignore 확인

### Vercel 배포
- [ ] Vercel 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정
- [ ] 배포 실행
- [ ] 배포 URL 확인

### 배포 후 확인
- [ ] `/vote` 페이지 동작
- [ ] `/result` 페이지 동작
- [ ] 투표 기능 작동
- [ ] 실시간 갱신 작동
- [ ] 쿨다운 기능 작동

---

## 참고 자료

### 공식 문서
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 프로젝트 문서
- [PLAN.md](../PLAN.md) - 프로젝트 계획서
- [API.md](./API.md) - API 문서
- [REALTIME.md](./REALTIME.md) - 실시간 갱신 가이드
- [supabase/README.md](../supabase/README.md) - Supabase 설정 가이드

---

## 개발 타임라인

- **2025-12-30**: Milestone 0-6 완료
  - 프로젝트 셋업
  - Supabase 설정
  - API 구현
  - 투표/결과 페이지
  - 실시간 갱신
  - 어뷰징 방지
- **진행 중**: Milestone 7 (배포 준비)

---

## 문의 및 이슈
GitHub Issues: https://github.com/MinhoiKoo/Noodle-poll/issues
