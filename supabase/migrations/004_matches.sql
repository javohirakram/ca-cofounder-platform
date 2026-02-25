-- 004_matches.sql

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references public.profiles(id) on delete cascade not null,
  user_b uuid references public.profiles(id) on delete cascade not null,
  score integer default 0,
  score_breakdown jsonb default '{}'::jsonb,
  status text default 'pending',
  last_computed_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_a, user_b)
);

alter table public.matches enable row level security;

create index idx_matches_user_a on public.matches(user_a);
create index idx_matches_user_b on public.matches(user_b);
create index idx_matches_score on public.matches(score desc);
create index idx_matches_status on public.matches(status);
