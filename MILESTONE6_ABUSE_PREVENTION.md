# Milestone 6: 어뷰징 방지 (Abuse Prevention)

## 개요
투표 시스템의 중복 투표를 방지하기 위한 쿠키 기반 쿨다운(Cooldown) 메커니즘을 구현했습니다.

## 구현 방식: 쿠키 기반 쿨다운

### 선택 이유
1. **간단한 구현**: 추가적인 데이터베이스 테이블이나 복잡한 인증 시스템 불필요
2. **빠른 응답**: 서버 측 쿠키 검증으로 빠른 차단 가능
3. **적절한 보안**: httpOnly, secure, sameSite 속성으로 기본적인 보안 확보
4. **자동 만료**: 쿠키 maxAge로 자동 만료되어 별도 정리 작업 불필요

### 기술 스펙

#### 서버 측 (API Route)
**파일**: `app/api/vote/route.ts`

**쿨다운 설정**:
```typescript
const VOTE_COOLDOWN_MS = 60 * 1000 // 60초
```

**쿠키 검증 로직**:
1. 요청에서 `lastVotedAt` 쿠키 읽기
2. 마지막 투표 시간과 현재 시간 비교
3. 60초 이내인 경우 429 (Too Many Requests) 응답
4. 남은 시간을 초 단위로 계산하여 응답에 포함

**쿠키 설정**:
```typescript
response.cookies.set('lastVotedAt', Date.now().toString(), {
  httpOnly: true,        // XSS 공격 방지
  secure: production,    // HTTPS에서만 전송 (프로덕션)
  sameSite: 'lax',      // CSRF 공격 방지
  maxAge: 60,           // 60초 후 자동 만료
  path: '/',            // 전역 접근
})
```

**응답 형식** (429 에러):
```json
{
  "ok": false,
  "message": "너무 자주 투표할 수 없습니다. N초 후 다시 시도해주세요.",
  "remainingSeconds": 45,
  "cooldownMs": 60000
}
```

#### 클라이언트 측 (Vote Page)
**파일**: `app/vote/page.tsx`

**쿨다운 처리**:
1. 429 응답 감지
2. 에러 메시지 표시 (노란색 배경으로 구분)
3. 카운트다운 타이머 표시 (시각적 진행바 포함)
4. 1초마다 남은 시간 업데이트

**UI 특징**:
- 일반 에러: 빨간색 배경 (⚠️)
- 쿨다운 에러: 노란색 배경 (⏰)
- 원형 진행바로 남은 시간 시각화
- 실시간 카운트다운 (N초)

## 보안 특징

### 1. HttpOnly 쿠키
```typescript
httpOnly: true
```
- 클라이언트 JavaScript에서 쿠키 접근 불가
- XSS 공격으로 쿠키 탈취 방지

### 2. Secure 쿠키 (프로덕션)
```typescript
secure: process.env.NODE_ENV === 'production'
```
- HTTPS 연결에서만 쿠키 전송
- 중간자 공격(MITM) 방지

### 3. SameSite 속성
```typescript
sameSite: 'lax'
```
- CSRF(Cross-Site Request Forgery) 공격 방지
- 다른 사이트에서의 요청 제한

### 4. 자동 만료
```typescript
maxAge: VOTE_COOLDOWN_MS / 1000
```
- 60초 후 자동 삭제
- 서버 측 정리 작업 불필요

## 사용자 경험 (UX)

### 정상 투표 플로우
1. 사용자가 선택 후 "투표하기" 클릭
2. 투표 성공 → `/result`로 이동
3. `lastVotedAt` 쿠키 설정 (60초 유효)

### 쿨다운 상태 플로우
1. 60초 이내 재투표 시도
2. 노란색 경고 메시지 표시
3. 원형 진행바와 카운트다운 표시
4. 60초 경과 후 자동으로 쿨다운 해제

### 시각적 피드백
```
⏰ 너무 자주 투표할 수 없습니다. 45초 후 다시 시도해주세요.

   [진행바] 45초
```

## 제한 사항 및 우회 가능성

### 제한 사항
1. **쿠키 삭제**: 사용자가 브라우저 쿠키를 수동으로 삭제하면 우회 가능
2. **시크릿 모드**: 다른 브라우저나 시크릿 모드 사용 시 우회 가능
3. **IP 기반 차단 없음**: 동일 IP에서 여러 브라우저 사용 가능

### 향후 개선 방안 (선택적)
1. **IP 기반 제한**: Supabase에 투표 이력 저장 (IP 주소 + 타임스탬프)
2. **세션 기반 제한**: 사용자 세션 ID 기반 중복 체크
3. **Fingerprinting**: 브라우저 지문 인식 기술 활용
4. **ReCAPTCHA**: 봇 방지를 위한 CAPTCHA 추가

## 테스트 시나리오

### 1. 정상 투표
- [ ] 첫 투표 성공
- [ ] `/result`로 정상 이동
- [ ] 쿠키 설정 확인

### 2. 쿨다운 테스트
- [ ] 60초 이내 재투표 시도
- [ ] 429 응답 수신
- [ ] 노란색 경고 메시지 표시
- [ ] 카운트다운 타이머 작동

### 3. 쿨다운 만료
- [ ] 60초 경과 후 투표 가능
- [ ] 정상 투표 처리
- [ ] 새 쿠키 설정

### 4. 브라우저 테스트
- [ ] Chrome: 정상 작동
- [ ] Firefox: 정상 작동
- [ ] Safari: 정상 작동
- [ ] Edge: 정상 작동

## 코드 위치

### 서버 측
- **API Route**: [app/api/vote/route.ts](app/api/vote/route.ts)
  - Line 4-5: 쿨다운 설정
  - Line 26-47: 쿨다운 검증 로직
  - Line 78-84: 쿠키 설정

### 클라이언트 측
- **Vote Page**: [app/vote/page.tsx](app/vote/page.tsx)
  - Line 6-11: VoteErrorResponse 인터페이스
  - Line 18: cooldownSeconds 상태
  - Line 45-65: 429 응답 처리 로직
  - Line 135-167: 카운트다운 UI

## 완료 기준 (DoD)

- [x] 60초 쿨다운 메커니즘 구현
- [x] 429 상태 코드 반환
- [x] 쿠키 기반 시간 추적
- [x] 클라이언트 측 에러 메시지 표시
- [x] 남은 시간 카운트다운 UI
- [x] HttpOnly, Secure, SameSite 보안 속성 적용
- [x] 문서화 완료

## API 명세 업데이트

### POST /api/vote

**새로운 에러 응답**:
```
Status: 429 Too Many Requests
{
  "ok": false,
  "message": "너무 자주 투표할 수 없습니다. N초 후 다시 시도해주세요.",
  "remainingSeconds": number,
  "cooldownMs": 60000
}
```

**쿠키**:
- Name: `lastVotedAt`
- Value: timestamp (milliseconds)
- Attributes: `httpOnly`, `secure` (production), `sameSite=lax`, `maxAge=60`

## 결론

Milestone 6의 어뷰징 방지 기능이 성공적으로 구현되었습니다:

✅ **구현 완료**:
- 쿠키 기반 60초 쿨다운
- 서버 측 검증 및 차단
- 클라이언트 측 시각적 피드백
- 보안 쿠키 설정

✅ **사용자 경험**:
- 명확한 에러 메시지
- 실시간 카운트다운
- 시각적 진행바

✅ **보안**:
- HttpOnly (XSS 방지)
- Secure (HTTPS 강제)
- SameSite (CSRF 방지)
- 자동 만료

이 구현은 기본적인 어뷰징 방지에 충분하며, 필요시 향후 IP 기반 제한이나 세션 추적 등으로 강화할 수 있습니다.
