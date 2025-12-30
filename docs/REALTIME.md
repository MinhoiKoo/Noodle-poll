# 실시간 결과 갱신 가이드

## 개요
결과 페이지(`/result`)에서 투표 결과를 자동으로 갱신하여 실시간으로 확인할 수 있는 기능입니다.

---

## 구현 방식

### 폴링 (Polling) 방식 채택
- **방법**: 일정 주기(3초)마다 `GET /api/result` API를 호출
- **장점**:
  - 구현이 간단하고 안정적
  - 서버 부담이 적음
  - WebSocket 불필요
- **단점**:
  - 완전한 실시간은 아님 (3초 지연)
  - 네트워크 트래픽 증가 (변경 없어도 호출)

### 대안: Supabase Realtime (선택 사항)
Supabase는 PostgreSQL의 변경사항을 실시간으로 구독할 수 있는 Realtime 기능을 제공합니다.

```typescript
// 예시: Supabase Realtime 구독
const supabase = createClient()

supabase
  .channel('votes-channel')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'votes'
  }, (payload) => {
    console.log('Change received!', payload)
    fetchResult() // 결과 갱신
  })
  .subscribe()
```

---

## 구현 세부사항

### 1. 상태 관리
```typescript
const [autoRefresh, setAutoRefresh] = useState(true)  // 자동 갱신 ON/OFF
const [isRefreshing, setIsRefreshing] = useState(false) // 갱신 중 표시
```

### 2. 폴링 로직
```typescript
useEffect(() => {
  if (!autoRefresh) return

  const intervalId = setInterval(() => {
    fetchResult(true) // 백그라운드 갱신
  }, 3000) // 3초마다

  return () => clearInterval(intervalId) // 클린업
}, [autoRefresh])
```

### 3. 최적화 전략

#### 백그라운드 갱신
```typescript
const fetchResult = async (isBackgroundRefresh = false) => {
  if (!isBackgroundRefresh) {
    setIsRefreshing(true) // 수동 갱신만 로딩 표시
  }
  // ... API 호출
}
```

#### 불필요한 리렌더 방지
- `isBackgroundRefresh` 플래그로 로딩 상태 분리
- 데이터가 실제로 변경된 경우만 UI 업데이트
- `useEffect` 의존성 배열 최소화

---

## UI 구성

### 1. 자동 갱신 토글 버튼
```typescript
<button onClick={() => setAutoRefresh(!autoRefresh)}>
  <div className={autoRefresh ? 'animate-pulse' : ''}>●</div>
  {autoRefresh ? '실시간 갱신 켜짐' : '실시간 갱신 꺼짐'}
</button>
```

**상태별 표시**:
- ✅ **켜짐**: 초록색 배경 + 점멸 애니메이션 (●)
- ⚪ **꺼짐**: 회색 배경 + 정지 상태

### 2. 갱신 중 인디케이터
```typescript
{isRefreshing && (
  <svg className="animate-spin">...</svg>
)}
```

### 3. 수동 새로고침 버튼
```typescript
<button
  onClick={() => fetchResult()}
  disabled={isRefreshing}
>
  {isRefreshing ? '새로고침 중...' : '🔄 수동 새로고침'}
</button>
```

---

## 성능 고려사항

### 1. 폴링 주기 설정
| 주기 | 장점 | 단점 |
|------|------|------|
| 1초 | 거의 실시간 | 서버/클라이언트 부담 증가 |
| **3초** (권장) | 적절한 균형 | 3초 지연 |
| 5초 | 서버 부담 적음 | 체감 지연 |

### 2. 네트워크 최적화
```typescript
const response = await fetch('/api/result', {
  cache: 'no-store', // 캐시 비활성화
})
```

### 3. 메모리 관리
```typescript
return () => clearInterval(intervalId) // 컴포넌트 언마운트 시 인터벌 정리
```

---

## 테스트 시나리오

### 단일 브라우저 테스트
1. `/result` 페이지 접속
2. "실시간 갱신 켜짐" 상태 확인
3. 3초마다 자동 갱신 확인 (업데이트 시간 변경)
4. 토글 버튼 클릭하여 꺼짐 → 자동 갱신 중지 확인
5. 수동 새로고침 버튼 클릭 → 즉시 갱신 확인

### 다중 브라우저 테스트
1. **브라우저 A**: `/result` 페이지 열기 (실시간 갱신 ON)
2. **브라우저 B**: `/vote` 페이지에서 투표
3. **브라우저 A**: 3초 이내에 결과 자동 갱신 확인

### 네트워크 에러 테스트
1. 개발자 도구 → Network 탭 → Offline 설정
2. 자동 갱신 시도 → 에러 핸들링 확인
3. Online 복구 → 자동 갱신 재개 확인

---

## 문제 해결

### Q1. 자동 갱신이 작동하지 않아요
**확인 사항**:
- 브라우저 콘솔에 에러 메시지 확인
- `autoRefresh` 상태가 `true`인지 확인
- 네트워크 탭에서 `/api/result` 호출 확인

### Q2. 페이지를 벗어나도 폴링이 계속되나요?
**답변**: 아니요. `useEffect`의 클린업 함수로 자동 정리됩니다.

```typescript
return () => clearInterval(intervalId) // 페이지 이탈 시 자동 중지
```

### Q3. 백그라운드 탭에서도 폴링하나요?
**답변**: 예. 하지만 브라우저가 백그라운드 탭의 타이머를 throttle할 수 있습니다.

---

## 향후 개선 방안

### 1. Supabase Realtime 적용
- 완전한 실시간 업데이트
- 폴링 오버헤드 제거
- DB 변경 감지 기반

### 2. 스마트 폴링
- 변경 없으면 주기 늘리기 (backoff)
- 사용자 활동 감지 기반 조절
- 투표가 활발한 시간대 감지

### 3. WebSocket 적용
- 양방향 실시간 통신
- 다중 사용자 동시 투표 알림
- 실시간 참여자 수 표시

### 4. SWR/React Query 도입
```typescript
import useSWR from 'swr'

const { data, error } = useSWR('/api/result', fetcher, {
  refreshInterval: 3000, // 3초마다 자동 갱신
  revalidateOnFocus: true, // 탭 포커스 시 갱신
})
```

---

## 코드 위치
- **구현 파일**: [app/result/page.tsx](../app/result/page.tsx)
- **관련 API**: [app/api/result/route.ts](../app/api/result/route.ts)

## 관련 문서
- [API 문서](./API.md)
- [Supabase 설정 가이드](../supabase/README.md)
