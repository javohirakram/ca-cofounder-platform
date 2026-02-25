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
-- 003_idea_upvotes.sql

create table if not exists public.idea_upvotes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(idea_id, user_id)
);

alter table public.idea_upvotes enable row level security;

create index idx_idea_upvotes_idea_id on public.idea_upvotes(idea_id);
create index idx_idea_upvotes_user_id on public.idea_upvotes(user_id);

-- Function to update upvote count on ideas
create or replace function public.update_idea_upvotes()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.ideas set upvotes = upvotes + 1 where id = NEW.idea_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.ideas set upvotes = upvotes - 1 where id = OLD.idea_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_idea_upvote_change
  after insert or delete on public.idea_upvotes
  for each row execute function public.update_idea_upvotes();
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
-- 005_connections.sql

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.connections enable row level security;

create index idx_connections_requester on public.connections(requester_id);
create index idx_connections_recipient on public.connections(recipient_id);
create index idx_connections_status on public.connections(status);
-- 006_threads_messages.sql

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid references public.profiles(id) on delete cascade not null,
  participant_b uuid references public.profiles(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(participant_a, participant_b)
);

alter table public.threads enable row level security;

create index idx_threads_participant_a on public.threads(participant_a);
create index idx_threads_participant_b on public.threads(participant_b);
create index idx_threads_last_message on public.threads(last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create index idx_messages_thread_id on public.messages(thread_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_created_at on public.messages(created_at);

-- Update thread's last_message_at when new message is sent
create or replace function public.update_thread_last_message()
returns trigger as $$
begin
  update public.threads set last_message_at = now() where id = NEW.thread_id;
  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_new_message
  after insert on public.messages
  for each row execute function public.update_thread_last_message();
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
-- 009_notifications.sql

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text,
  body text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);
-- 010_functions_triggers.sql
-- Profile completeness calculation and utility functions

create or replace function public.calculate_profile_completeness(profile_row public.profiles)
returns integer as $$
declare
  score integer := 0;
  total_fields integer := 10;
begin
  if profile_row.full_name is not null and profile_row.full_name != '' then score := score + 1; end if;
  if profile_row.avatar_url is not null and profile_row.avatar_url != '' then score := score + 1; end if;
  if profile_row.headline is not null and profile_row.headline != '' then score := score + 1; end if;
  if profile_row.bio is not null and profile_row.bio != '' then score := score + 1; end if;
  if array_length(profile_row.role, 1) > 0 then score := score + 1; end if;
  if array_length(profile_row.skills, 1) > 0 then score := score + 1; end if;
  if profile_row.country is not null and profile_row.country != '' then score := score + 1; end if;
  if array_length(profile_row.industries, 1) > 0 then score := score + 1; end if;
  if profile_row.commitment is not null and profile_row.commitment != '' then score := score + 1; end if;
  if array_length(profile_row.languages, 1) > 0 then score := score + 1; end if;

  return (score * 100) / total_fields;
end;
$$ language plpgsql;

-- Trigger to update profile completeness on profile change
create or replace function public.update_profile_completeness()
returns trigger as $$
begin
  NEW.profile_completeness := public.calculate_profile_completeness(NEW);
  NEW.updated_at := now();
  return NEW;
end;
$$ language plpgsql;

create or replace trigger on_profile_update
  before update on public.profiles
  for each row execute function public.update_profile_completeness();

-- Get or create thread function
create or replace function public.get_or_create_thread(p_user_a uuid, p_user_b uuid)
returns uuid as $$
declare
  thread_id uuid;
  a uuid;
  b uuid;
begin
  -- Ensure consistent ordering
  if p_user_a < p_user_b then
    a := p_user_a;
    b := p_user_b;
  else
    a := p_user_b;
    b := p_user_a;
  end if;

  -- Try to find existing thread
  select id into thread_id from public.threads
  where (participant_a = a and participant_b = b);

  -- Create if not found
  if thread_id is null then
    insert into public.threads (participant_a, participant_b)
    values (a, b)
    returning id into thread_id;
  end if;

  return thread_id;
end;
$$ language plpgsql security definer;
-- 011_rls_policies.sql
-- Row Level Security policies for all tables

-- PROFILES: public read, own write
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- IDEAS: public read, own write/delete
create policy "Ideas are publicly readable"
  on public.ideas for select
  using (true);

create policy "Users can create ideas"
  on public.ideas for insert
  with check (auth.uid() = author_id);

create policy "Users can update own ideas"
  on public.ideas for update
  using (auth.uid() = author_id);

create policy "Users can delete own ideas"
  on public.ideas for delete
  using (auth.uid() = author_id);

-- IDEA_UPVOTES: public read, own insert/delete
create policy "Upvotes are publicly readable"
  on public.idea_upvotes for select
  using (true);

create policy "Users can upvote"
  on public.idea_upvotes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own upvote"
  on public.idea_upvotes for delete
  using (auth.uid() = user_id);

-- MATCHES: read own matches only
create policy "Users can read own matches"
  on public.matches for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can update own matches"
  on public.matches for update
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Service role can manage matches"
  on public.matches for all
  using (auth.jwt()->>'role' = 'service_role');

-- CONNECTIONS: read own connections only
create policy "Users can read own connections"
  on public.connections for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Users can create connection requests"
  on public.connections for insert
  with check (auth.uid() = requester_id);

create policy "Users can update connection status"
  on public.connections for update
  using (auth.uid() = recipient_id or auth.uid() = requester_id);

-- THREADS: read own threads only
create policy "Users can read own threads"
  on public.threads for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Users can create threads"
  on public.threads for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

-- MESSAGES: read own thread messages only
create policy "Users can read messages in their threads"
  on public.messages for select
  using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
      and (t.participant_a = auth.uid() or t.participant_b = auth.uid())
    )
  );

create policy "Users can send messages in their threads"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.threads t
      where t.id = thread_id
      and (t.participant_a = auth.uid() or t.participant_b = auth.uid())
    )
  );

create policy "Users can update own messages"
  on public.messages for update
  using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
      and (t.participant_a = auth.uid() or t.participant_b = auth.uid())
    )
  );

-- IDEA_INTERESTS: read own, create own
create policy "Users can read interests on own ideas or by themselves"
  on public.idea_interests for select
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.ideas i where i.id = idea_id and i.author_id = auth.uid()
    )
  );

create policy "Users can express interest"
  on public.idea_interests for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own interest"
  on public.idea_interests for delete
  using (auth.uid() = user_id);

-- ACCELERATORS: public read, admin write
create policy "Accelerators are publicly readable"
  on public.accelerators for select
  using (true);

create policy "Admins can manage accelerators"
  on public.accelerators for all
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ACCELERATOR_MEMBERS: public read
create policy "Accelerator members are publicly readable"
  on public.accelerator_members for select
  using (true);

create policy "Users can join accelerators"
  on public.accelerator_members for insert
  with check (auth.uid() = user_id);

-- NOTIFICATIONS: read/write own only
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
