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
