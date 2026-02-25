-- 007_idea_interests.sql

create table if not exists public.idea_interests (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  created_at timestamptz default now(),
  unique(idea_id, user_id)
);

alter table public.idea_interests enable row level security;

create index idx_idea_interests_idea on public.idea_interests(idea_id);
create index idx_idea_interests_user on public.idea_interests(user_id);
