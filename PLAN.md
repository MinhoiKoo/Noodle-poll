# PLAN.md — 짜장면 vs 짬뽕 투표 (Next.js)

## 목표
사용자가 **짜장면/짬뽕 중 하나를 선택해 투표(POST)** 하고,
누적 결과를 **조회(GET)** 하며,
결과는 **서버에서 관리**되어 **새로고침에도 유지**되는 웹서비스를 Next.js로 구현한다.

- Vote URL: `/vote`
- Result URL: `/result`
- 핵심 검증 포인트: 서버–클라이언트 분리, 상태 변경/조회 분리, 기본 웹 구조 이해
- **배포**: Vercel
- **데이터베이스**: Supabase

---

## Milestone 0 — 프로젝트 셋업 & 기본 라우팅
**목표:** 실행 가능한 Next.js 프로젝트 골격과 `/vote`, `/result` 라우팅 확보

### TODO
- [ ] Next.js 프로젝트 생성 (App Router 권장)
- [ ] 라우트 생성
  - [ ] `app/vote/page.tsx`
  - [ ] `app/result/page.tsx`
- [ ] 기본 UI(placeholder)로 페이지 접근 확인
- [ ] (선택) 기본 레이아웃/네비게이션 링크 추가

### 완료 기준 (DoD)
- [ ] 브라우저에서 `/vote`, `/result` 접속 시 정상 렌더링
- [ ] `npm run dev`로 로컬 실행 가능

---

## Milestone 1 — 서버 데이터 저장소 (Supabase)
**목표:** 결과를 Supabase 데이터베이스에서 관리하고, 새로고침 후에도 유지되는 저장 구조 마련

### 설계 선택
- **Supabase PostgreSQL 사용**
  - 장점: 클라우드 기반 영구 저장, Vercel 배포 환경과 호환성 우수
  - 실시간 기능 활용 가능 (선택 사항)

### TODO
- [ ] Supabase 프로젝트 생성 및 설정
  - [ ] 계정 생성 및 프로젝트 초기화
  - [ ] API URL 및 anon key 발급
- [ ] `votes` 테이블 스키마 정의
  - `id`: primary key
  - `choice`: varchar ('jjajang' | 'jjamppong')
  - `created_at`: timestamp
- [ ] 또는 간단한 카운터 테이블 설계
  - `choice`: primary key ('jjajang' | 'jjamppong')
  - `count`: integer
  - `updated_at`: timestamp
- [ ] Supabase 클라이언트 설정 (`lib/supabase.ts`)
  - [ ] 환경 변수 설정 (`.env.local`)
  - [ ] Supabase client 초기화
- [ ] 저장소 유틸 구현 (`lib/store.ts`)
  - [ ] read(): 현재 카운트 반환
  - [ ] increment(choice): 해당 카운트 증가

### 완료 기준 (DoD)
- [ ] Supabase 데이터베이스 연결 확인
- [ ] read/increment 함수로 데이터 접근 가능
- [ ] 새로고침해도 결과 유지
- [ ] 서버 재시작 후에도 Supabase에서 결과 유지

---

## Milestone 2 — API 구현 (상태 변경/조회 분리)
**목표:** 투표는 POST, 결과 조회는 GET으로 API를 분리 구현

### API 스펙
- `POST /api/vote`
  - body: `{ choice: "jjajang" | "jjamppong" }`
  - response: `{ ok: true }` 또는 `{ ok: false, message }`
- `GET /api/result`
  - response: `{ jjajang, jjamppong, total, updatedAt }`

### TODO
- [ ] `app/api/vote/route.ts`
  - [ ] request body validation
  - [ ] store.increment(choice) 호출 (Supabase)
  - [ ] 적절한 status code 반환
- [ ] `app/api/result/route.ts`
  - [ ] store.read() 호출 (Supabase)
  - [ ] total/updatedAt 포함해 반환

### 완료 기준 (DoD)
- [ ] curl/Postman으로 API 동작 확인
  - [ ] POST 요청 시 카운트 증가
  - [ ] GET 요청 시 최신 카운트 반환

---

## Milestone 3 — 투표 페이지(`/vote`) 완성
**목표:** 사용자가 선택 후 투표하고 `/result`로 이동하는 흐름 완성

### UI 요구사항
- 선택지: 🍜 짜장면 / 🍲 짬뽕 (둘 중 하나)
- 버튼: "투표하기"

### TODO
- [ ] 라디오/버튼 등으로 단일 선택 UI 구현
- [ ] "투표하기" 클릭 시
  - [ ] 선택값 검증(미선택 시 안내)
  - [ ] `POST /api/vote` 호출
  - [ ] 성공 시 `/result`로 이동
  - [ ] 실패 시 에러 메시지 표시

### 완료 기준 (DoD)
- [ ] `/vote`에서 투표 성공 → `/result`로 자동 이동
- [ ] 연속 투표/오류 상황에서 사용자 피드백 제공

---

## Milestone 4 — 결과 페이지(`/result`) 완성
**목표:** 누적 결과를 조회하고 표시, (선택) 재투표 링크 제공

### UI 요구사항
- "짜장면 : N표", "짬뽕 : M표"
- (선택) "다시 투표하기" 링크 → `/vote`

### TODO
- [ ] 페이지 진입 시 `GET /api/result` 호출하여 결과 표시
- [ ] 로딩/에러 상태 처리
- [ ] (선택) 다시 투표 링크 제공

### 완료 기준 (DoD)
- [ ] `/result`에서 최신 결과 정상 표시
- [ ] 새로고침해도 결과 유지(Supabase 저장 기반)

---

## Milestone 5 — "실시간" 결과 반영(선택/가산점)
**목표:** 결과 페이지에서 자동 갱신으로 실시간 확인 느낌 제공

### 옵션
- 폴링(권장): 2~5초 주기로 `GET /api/result`
- 또는 Supabase Realtime 기능 활용
- 또는 SWR/React Query로 revalidate

### TODO
- [ ] 폴링 로직 추가 또는 Supabase Realtime 구독
- [ ] 불필요한 리렌더/중복 요청 최소화(기본 수준이면 충분)

### 완료 기준 (DoD)
- [ ] 다른 사람이 투표하면 `/result`에서 주기적으로 수치가 갱신됨

---

## Milestone 6 — 어뷰징 방지(선택/가산점)
**목표:** 간단한 중복 투표 방지 도입

### 추천 1안: 쿠키 기반 쿨다운(가장 쉬움)
- 투표 성공 시 쿠키 기록 (예: `votedAt`)
- 일정 시간 내 재투표 요청 시 429 응답

### 추천 2안: Supabase 기반 IP/세션 트래킹
- Supabase 테이블에 투표 이력 저장
- IP 주소 또는 세션 ID 기반 중복 체크

### TODO
- [ ] `POST /api/vote`에서 쿠키/시간 검사 또는 DB 조회
- [ ] 차단 시 에러 메시지/상태코드 반환
- [ ] 클라이언트에서 안내 문구 표시

### 완료 기준 (DoD)
- [ ] 짧은 시간 내 반복 투표가 제한됨
- [ ] 제한 사유가 사용자에게 안내됨

---

## Milestone 7 — 배포 & 제출 준비 (Vercel)
**목표:** Vercel에 배포하여 Public URL로 과제 요구 URL 접근 가능, 실행 방법 정리

### TODO
- [ ] Production build 확인 (`npm run build && npm run start`)
- [ ] Vercel 배포 설정
  - [ ] Vercel 계정 연결 및 프로젝트 import
  - [ ] 환경 변수 설정 (Supabase URL, API Key)
  - [ ] 배포 후 URL 확인
- [ ] 배포된 환경에서 동작 확인
  - [ ] `https://{vercel-domain}/vote` 접속 확인
  - [ ] `https://{vercel-domain}/result` 접속 확인
- [ ] README 작성
  - [ ] 로컬 실행 방법
  - [ ] API 스펙
  - [ ] 저장 방식 설명 (Supabase PostgreSQL)
  - [ ] 배포 플랫폼 (Vercel)
  - [ ] 환경 변수 설정 가이드
  - [ ] (선택) 어뷰징 방지/실시간 갱신 설명

### 완료 기준 (DoD)
- [ ] Vercel에서 `/vote`, `/result` 정상 동작
- [ ] 실행/테스트 방법이 문서로 재현 가능
- [ ] 환경 변수 및 Supabase 연동 설정 완료

---
