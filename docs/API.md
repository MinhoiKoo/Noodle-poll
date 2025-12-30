# API 문서

## 개요
짜장면 vs 짬뽕 투표 시스템의 RESTful API 문서입니다.

---

## 엔드포인트 목록

### 1. POST /api/vote
투표를 등록합니다.

#### Request
```http
POST /api/vote HTTP/1.1
Content-Type: application/json

{
  "choice": "jjajang" | "jjamppong"
}
```

#### Request Body
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| choice | string | ✅ | 투표할 선택지 (`jjajang` 또는 `jjamppong`) |

#### Response
**성공 (200 OK)**
```json
{
  "ok": true
}
```

**실패 - 선택값 누락 (400 Bad Request)**
```json
{
  "ok": false,
  "message": "선택값이 필요합니다."
}
```

**실패 - 유효하지 않은 선택 (400 Bad Request)**
```json
{
  "ok": false,
  "message": "유효하지 않은 선택입니다. (jjajang 또는 jjamppong만 가능)"
}
```

**실패 - 서버 오류 (500 Internal Server Error)**
```json
{
  "ok": false,
  "message": "투표 처리 중 오류가 발생했습니다."
}
```

#### cURL 예제
```bash
# 짜장면 투표
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"choice":"jjajang"}'

# 짬뽕 투표
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"choice":"jjamppong"}'
```

---

### 2. GET /api/result
현재 투표 결과를 조회합니다.

#### Request
```http
GET /api/result HTTP/1.1
```

#### Response
**성공 (200 OK)**
```json
{
  "jjajang": 42,
  "jjamppong": 38,
  "total": 80,
  "updatedAt": "2025-12-30T12:34:56.789Z"
}
```

#### Response Fields
| 필드 | 타입 | 설명 |
|------|------|------|
| jjajang | number | 짜장면 득표 수 |
| jjamppong | number | 짬뽕 득표 수 |
| total | number | 전체 투표 수 |
| updatedAt | string | 마지막 업데이트 시간 (ISO 8601 형식) |

**실패 - 서버 오류 (500 Internal Server Error)**
```json
{
  "jjajang": 0,
  "jjamppong": 0,
  "total": 0,
  "updatedAt": "2025-12-30T12:34:56.789Z",
  "error": "결과 조회 중 오류가 발생했습니다."
}
```

#### cURL 예제
```bash
curl -X GET http://localhost:3000/api/result
```

#### Cache Headers
결과 API는 캐싱을 비활성화하여 항상 최신 데이터를 반환합니다:
```
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Expires: 0
```

---

## 에러 코드

| HTTP 상태 코드 | 설명 |
|---------------|------|
| 200 | 요청 성공 |
| 201 | 리소스 생성 성공 |
| 400 | 잘못된 요청 (유효성 검증 실패) |
| 404 | 리소스를 찾을 수 없음 |
| 405 | 허용되지 않은 HTTP 메서드 |
| 500 | 서버 내부 오류 |

---

## 테스트

### PowerShell에서 테스트
```powershell
.\scripts\test-api.ps1
```

### Bash에서 테스트
```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

### JavaScript/TypeScript에서 사용
```typescript
// 투표하기
const vote = async (choice: 'jjajang' | 'jjamppong') => {
  const response = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice }),
  })
  return await response.json()
}

// 결과 조회
const getResult = async () => {
  const response = await fetch('/api/result')
  return await response.json()
}

// 사용 예제
await vote('jjajang')
const result = await getResult()
console.log(result) // { jjajang: 1, jjamppong: 0, total: 1, updatedAt: "..." }
```

---

## 데이터베이스 스키마

투표 데이터는 Supabase PostgreSQL에 저장됩니다.

### votes 테이블
| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| choice | text | PRIMARY KEY, CHECK (choice IN ('jjajang', 'jjamppong')) | 선택지 |
| count | integer | NOT NULL, DEFAULT 0 | 투표 수 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 마지막 업데이트 시간 |

### increment_vote 함수
원자적 업데이트를 보장하는 PostgreSQL 함수:
```sql
increment_vote(vote_choice text) RETURNS void
```

---

## 보안 고려사항

### 현재 구현
- ✅ Request body 유효성 검증
- ✅ SQL Injection 방지 (Supabase ORM 사용)
- ✅ 원자적 업데이트 (PostgreSQL 함수)

### 향후 개선 사항
- ⏳ 어뷰징 방지 (쿠키/IP 기반 쿨다운)
- ⏳ Rate Limiting
- ⏳ CORS 설정
- ⏳ API 키 인증

---

## 성능 최적화

### 캐싱 전략
- 결과 API: 캐시 비활성화 (실시간 데이터 우선)
- 투표 API: POST 요청이므로 캐시 불필요

### 데이터베이스 최적화
- 인덱스: `updated_at` 컬럼 DESC 인덱스
- 원자적 업데이트: PostgreSQL 함수 사용으로 동시성 제어

---

## 버전 정보
- API 버전: 1.0.0
- 최종 업데이트: 2025-12-30
