'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { ThreadList } from '@/components/messaging/ThreadList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { MessageSquare } from 'lucide-react';
import type { Thread, Profile, Message } from '@/types/database';

interface ThreadWithDetails {
  thread: Thread;
  otherUser: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const t = useTranslations('messaging');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [threads, setThreads] = useState<ThreadWithDetails[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const activeThread = threads.find((t) => t.thread.id === activeThreadId);
  const otherUser = activeThread?.otherUser ?? null;

  const fetchThreads = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    setCurrentUserId(userId);

    // Fetch current user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setCurrentUserProfile((profile as unknown as Profile) ?? null);

    // Fetch threads where user is participant
    const { data: threadsData, error } = await supabase
      .from('threads')
      .select('*')
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      setLoading(false);
      return;
    }

    const rawThreads = (threadsData as Thread[]) ?? [];

    // Collect other user IDs
    const otherUserIds = rawThreads.map((t) =>
      t.participant_a === userId ? t.participant_b : t.participant_a
    );

    if (otherUserIds.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }

    // Fetch other user profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    const profileMap = new Map<string, Profile>();
    ((profiles as Profile[]) ?? []).forEach((p) => profileMap.set(p.id, p));

    // Fetch last message for each thread
    const threadDetails: ThreadWithDetails[] = [];

    for (const thread of rawThreads) {
      const otherUserId =
        thread.participant_a === userId ? thread.participant_b : thread.participant_a;
      const otherUserProfile = profileMap.get(otherUserId);

      if (!otherUserProfile) continue;

      // Last message
      const { data: lastMsgData } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      threadDetails.push({
        thread,
        otherUser: otherUserProfile,
        lastMessage: (lastMsgData as unknown as Message) ?? null,
        unreadCount: unreadCount ?? 0,
      });
    }

    setThreads(threadDetails);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Realtime subscription for new messages across all threads
  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();

    const channel = supabase
      .channel('messages-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;

          // Update thread's last message and unread count
          setThreads((prev) =>
            prev.map((t) => {
              if (t.thread.id !== newMsg.thread_id) return t;
              return {
                ...t,
                lastMessage: newMsg,
                unreadCount:
                  newMsg.sender_id !== currentUserId
                    ? t.unreadCount + 1
                    : t.unreadCount,
                thread: {
                  ...t.thread,
                  last_message_at: newMsg.created_at,
                },
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  function handleSelectThread(threadId: string) {
    setActiveThreadId(threadId);
    setShowChat(true);

    // Reset unread count for selected thread
    setThreads((prev) =>
      prev.map((t) => {
        if (t.thread.id !== threadId) return t;
        return { ...t, unreadCount: 0 };
      })
    );
  }

  function handleBack() {
    setShowChat(false);
    setActiveThreadId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} />
        <div className="flex gap-0 border rounded-xl overflow-hidden bg-card h-[calc(100vh-12rem)]">
          <div className="w-80 border-r p-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 bg-muted rounded" />
                  <div className="h-3 w-40 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1">
            <LoadingSkeleton variant="chat" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} />
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title={t('noMessages')}
          description="Please log in to view your messages."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <div className="border rounded-xl overflow-hidden bg-card h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Thread list - always visible on desktop, conditionally on mobile */}
          <div
            className={cn(
              'w-full md:w-80 md:border-r shrink-0',
              showChat ? 'hidden md:block' : 'block'
            )}
          >
            <ThreadList
              threads={threads}
              activeThreadId={activeThreadId}
              onSelectThread={handleSelectThread}
            />
          </div>

          {/* Chat window - always visible on desktop, conditionally on mobile */}
          <div
            className={cn(
              'flex-1 flex flex-col',
              showChat ? 'block' : 'hidden md:flex'
            )}
          >
            <ChatWindow
              threadId={activeThreadId}
              currentUserId={currentUserId}
              otherUser={otherUser}
              currentUserProfile={currentUserProfile}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
