'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { PageHeader } from '@/components/shared/PageHeader';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageSquare } from 'lucide-react';
import type { Thread, Profile } from '@/types/database';

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const locale = params.locale as string;
  const t = useTranslations('messaging');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchThread = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    setCurrentUserId(userId);

    // Fetch current user profile
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setCurrentUserProfile((myProfile as unknown as Profile) ?? null);

    // Fetch thread
    const { data: threadData, error } = await supabase
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error || !threadData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const thread = threadData as Thread;

    // Ensure user is a participant
    if (thread.participant_a !== userId && thread.participant_b !== userId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Get other user
    const otherUserId =
      thread.participant_a === userId ? thread.participant_b : thread.participant_a;

    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId)
      .single();

    setOtherUser((otherProfile as unknown as Profile) ?? null);
    setLoading(false);
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  function handleBack() {
    window.history.back();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} />
        <div className="border rounded-xl overflow-hidden bg-card h-[calc(100vh-12rem)]">
          <LoadingSkeleton variant="chat" />
        </div>
      </div>
    );
  }

  if (notFound || !currentUserId) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} />
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title={t('noMessages')}
          description="This conversation could not be found."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <div className="border rounded-xl overflow-hidden bg-card h-[calc(100vh-12rem)]">
        <ChatWindow
          threadId={threadId}
          currentUserId={currentUserId}
          otherUser={otherUser}
          currentUserProfile={currentUserProfile}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
