'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare } from 'lucide-react';
import type { Thread, Profile, Message } from '@/types/database';

interface ThreadWithDetails {
  thread: Thread;
  otherUser: Profile;
  lastMessage: Message | null;
  unreadCount: number;
}

interface ThreadListProps {
  threads: ThreadWithDetails[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export function ThreadList({
  threads,
  activeThreadId,
  onSelectThread,
}: ThreadListProps) {
  const t = useTranslations('messaging');
  const [search, setSearch] = useState('');

  const sortedThreads = useMemo(() => {
    let filtered = threads;

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = threads.filter((t) =>
        t.otherUser.full_name?.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.thread.last_message_at).getTime();
      const bTime = new Date(b.thread.last_message_at).getTime();
      return bTime - aTime;
    });
  }, [threads, search]);

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">{t('noMessages')}</p>
        <p className="text-xs text-muted-foreground text-center">{t('startConversation')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchThreads')}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Thread list */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {sortedThreads.map(({ thread, otherUser, lastMessage, unreadCount }) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                activeThreadId === thread.id && 'bg-accent'
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={otherUser.avatar_url ?? undefined}
                    alt={otherUser.full_name ?? ''}
                  />
                  <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                    {otherUser.full_name ? getInitials(otherUser.full_name) : '?'}
                  </AvatarFallback>
                </Avatar>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm truncate',
                      unreadCount > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                    )}
                  >
                    {otherUser.full_name}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatRelativeTime(thread.last_message_at)}
                  </span>
                </div>
                {lastMessage && (
                  <p
                    className={cn(
                      'text-xs truncate mt-0.5',
                      unreadCount > 0
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          ))}

          {sortedThreads.length === 0 && search.trim() && (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">No conversations found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
