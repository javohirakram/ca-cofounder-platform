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
