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
