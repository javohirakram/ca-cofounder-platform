-- 008_accelerators.sql

create table if not exists public.accelerators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  website text,
  country text,
  city text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.accelerators enable row level security;

create table if not exists public.accelerator_members (
  id uuid primary key default gen_random_uuid(),
  accelerator_id uuid references public.accelerators(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  cohort text,
  role text,
  created_at timestamptz default now()
);

alter table public.accelerator_members enable row level security;

create index idx_accel_members_accel on public.accelerator_members(accelerator_id);
create index idx_accel_members_user on public.accelerator_members(user_id);
