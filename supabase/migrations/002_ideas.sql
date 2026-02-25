-- 002_ideas.sql
-- Create ideas table for the startup idea board

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  problem text,
  solution text,
  stage text,
  industries text[] default '{}',
  country_focus text[] default '{}',
  looking_for_roles text[] default '{}',
  looking_for_description text,
  is_open boolean default true,
  upvotes integer default 0,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ideas enable row level security;

create index idx_ideas_author_id on public.ideas(author_id);
create index idx_ideas_is_open on public.ideas(is_open);
create index idx_ideas_created_at on public.ideas(created_at);
create index idx_ideas_upvotes on public.ideas(upvotes);
