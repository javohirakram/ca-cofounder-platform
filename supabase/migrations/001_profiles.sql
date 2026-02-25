-- 001_profiles.sql
-- Create profiles table that extends Supabase auth.users

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  headline text,
  bio text,
  role text[] default '{}',
  skills text[] default '{}',
  industries text[] default '{}',
  country text,
  city text,
  languages text[] default '{}',
  commitment text,
  idea_stage text,
  equity_min integer,
  equity_max integer,
  linkedin_url text,
  telegram_handle text,
  telegram_id bigint,
  looking_for_roles text[] default '{}',
  looking_for_description text,
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  ecosystem_tags text[] default '{}',
  is_actively_looking boolean default true,
  is_admin boolean default false,
  profile_completeness integer default 0,
  last_active timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create index for common queries
create index idx_profiles_country on public.profiles(country);
create index idx_profiles_is_actively_looking on public.profiles(is_actively_looking);
create index idx_profiles_last_active on public.profiles(last_active);
create index idx_profiles_created_at on public.profiles(created_at);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
