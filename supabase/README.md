# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://app.supabase.com) 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 설정
4. 프로젝트 생성 완료 대기 (1-2분 소요)

## 2. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 메뉴로 이동
2. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
3. "Run" 버튼 클릭하여 실행

또는 다음 SQL을 직접 실행:

```sql
-- 투표 카운터 테이블 생성
create table if not exists votes (
  choice text primary key check (choice in ('jjajang', 'jjamppong')),
  count integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 초기 데이터 삽입
insert into votes (choice, count) values
  ('jjajang', 0),
  ('jjamppong', 0)
on conflict (choice) do nothing;

-- RLS 활성화
alter table votes enable row level security;

-- 읽기 정책
create policy "Anyone can read votes"
  on votes for select
  using (true);

-- 투표 증가 함수
create or replace function increment_vote(vote_choice text)
returns void
language plpgsql
as $$
begin
  update votes
  set
    count = count + 1,
    updated_at = timezone('utc'::text, now())
  where choice = vote_choice;
end;
$$;
```

## 3. API 키 확인

1. Supabase 대시보드에서 **Settings** → **API** 메뉴로 이동
2. 다음 정보 확인:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**주의**: `.env.local` 파일은 Git에 커밋하지 마세요!

## 5. 데이터 확인

1. Supabase 대시보드에서 **Table Editor** 메뉴로 이동
2. `votes` 테이블 선택
3. 초기 데이터 확인:
   - `jjajang`: 0
   - `jjamppong`: 0

## 6. 테스트

로컬 개발 서버 실행:

```bash
npm run dev
```

브라우저에서 `/vote` 페이지 접속 후 투표 테스트

## 트러블슈팅

### "relation 'votes' does not exist" 오류
→ SQL Editor에서 `schema.sql` 다시 실행

### "Invalid API key" 오류
→ `.env.local` 파일의 API 키 확인

### RLS 정책 오류
→ SQL Editor에서 정책 생성 쿼리 다시 실행

## 스키마 정보

### votes 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| choice | text (PK) | 'jjajang' 또는 'jjamppong' |
| count | integer | 투표 수 (기본값: 0) |
| updated_at | timestamptz | 마지막 업데이트 시간 |

### increment_vote 함수
- **매개변수**: `vote_choice` (text)
- **반환**: void
- **기능**: 해당 선택지의 count를 1 증가시키고 updated_at 갱신
