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
