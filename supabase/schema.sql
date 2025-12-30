-- 투표 카운터 테이블 생성
-- 각 선택지(짜장면, 짬뽕)의 투표 수를 저장하는 간단한 카운터 테이블

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

-- RLS (Row Level Security) 활성화
alter table votes enable row level security;

-- 모든 사용자가 읽을 수 있도록 설정
create policy "Anyone can read votes"
  on votes for select
  using (true);

-- 인덱스 생성 (선택사항, 성능 최적화)
create index if not exists votes_updated_at_idx on votes(updated_at desc);

-- 투표 증가 함수 생성 (원자적 업데이트)
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
