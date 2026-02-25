'use client';

import { useRouter, useParams } from 'next/navigation';
import { cn, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import type { Notification } from '@/types/database';

const typeIconMap: Record<string, React.ElementType> = {
  connection_request: UserPlus,
  connection_accepted: UserCheck,
  new_message: MessageSquare,
  idea_interest: Lightbulb,
  new_match: Sparkles,
};

const typeColorMap: Record<string, string> = {
  connection_request: 'text-blue-500 bg-blue-500/10',
  connection_accepted: 'text-green-500 bg-green-500/10',
  new_message: 'text-violet-500 bg-violet-500/10',
  idea_interest: 'text-amber-500 bg-amber-500/10',
  new_match: 'text-pink-500 bg-pink-500/10',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const Icon = typeIconMap[notification.type] ?? Sparkles;
  const colorClasses = typeColorMap[notification.type] ?? 'text-muted-foreground bg-muted';

  async function handleClick() {
    if (!notification.is_read) {
      const supabase = createClient();
      await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('id', notification.id);
      onMarkAsRead(notification.id);
    }

    if (notification.link) {
      router.push(`/${locale}${notification.link}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors',
        'hover:bg-accent/50',
        !notification.is_read && 'bg-accent/30'
      )}
    >
      {/* Unread indicator */}
      <div className="flex shrink-0 items-center pt-1">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            !notification.is_read ? 'bg-primary' : 'bg-transparent'
          )}
        />
      </div>

      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          colorClasses
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p
            className={cn(
              'text-sm leading-snug',
              !notification.is_read
                ? 'font-medium text-foreground'
                : 'text-foreground/80'
            )}
          >
            {notification.title}
          </p>
        )}
        {notification.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </button>
  );
}
