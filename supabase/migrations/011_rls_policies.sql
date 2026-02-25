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
