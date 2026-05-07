-- ─────────────────────────────────────────────────────────────
-- Recall v0.1 — DB 스키마
-- 실행 위치: Supabase Dashboard → SQL Editor → New Query → 전체 붙여넣고 Run
-- 한 번만 실행. 다시 실행하면 "already exists" 에러 남 (정상 동작 보호 차원).
-- ─────────────────────────────────────────────────────────────

-- 1) BOOKS — 책 한 권당 한 행
create table public.books (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  author        text,
  summary       text,
  key_concepts  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2) NOTES — 한 책 아래 여러 노트, 시간순. 노트 자체엔 제목 없음.
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3) MESSAGES — 한 노트 안의 사용자/AI 메시지 시간순.
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references public.notes(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 인덱스 — 자주 하는 조회를 빠르게
-- ─────────────────────────────────────────────────────────────
create index books_user_created_idx    on public.books(user_id, created_at desc);
create index notes_book_created_idx    on public.notes(book_id, created_at desc);
create index messages_note_created_idx on public.messages(note_id, created_at asc);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security — 다른 사람 데이터 접근 차단
-- ─────────────────────────────────────────────────────────────
alter table public.books    enable row level security;
alter table public.notes    enable row level security;
alter table public.messages enable row level security;

create policy "books_owner_all" on public.books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes_owner_all" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "messages_owner_all" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- updated_at 자동 갱신 트리거 (books, notes에만)
-- ─────────────────────────────────────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.tg_set_updated_at();

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.tg_set_updated_at();
