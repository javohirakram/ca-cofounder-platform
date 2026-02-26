'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  Lightbulb,
  Sparkles,
  Check,
  X,
  Loader2,
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
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [actionTaken, setActionTaken] = useState<'accepted' | 'declined' | null>(null);

  const Icon = typeIconMap[notification.type] ?? Sparkles;
  const colorClasses = typeColorMap[notification.type] ?? 'text-muted-foreground bg-muted';

  // Extract requester profile ID from notification link (format: /profile/{id})
  const requesterId = notification.link?.replace('/profile/', '') ?? null;
  const isConnectionRequest = notification.type === 'connection_request' && !actionTaken;

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

    if (notification.link && !isConnectionRequest) {
      router.push(`/${locale}${notification.link}`);
    }
  }

  async function handleAccept(e: React.MouseEvent) {
    e.stopPropagation();
    if (!requesterId) return;
    setAccepting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const currentUserId = session.user.id;

      // Update connection status to accepted
      const { error: connError } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('connections') as any)
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending');

      if (connError) throw connError;

      // Create a message thread
      const { error: threadError } = await supabase
        .from('threads')
        .insert({
          participant_a: currentUserId,
          participant_b: requesterId,
        } as never);

      if (threadError && !threadError.message.includes('duplicate')) {
        console.error('Thread creation error:', threadError);
      }

      // Get current user's name for notification
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentUserId)
        .single();

      const myName = (myProfile as { full_name: string | null } | null)?.full_name ?? 'Someone';

      // Notify the requester
      await supabase.from('notifications').insert({
        user_id: requesterId,
        type: 'connection_accepted',
        title: `${myName} accepted your connection request`,
        body: 'You can now message each other.',
        link: `/profile/${currentUserId}`,
      } as never);

      // Mark this notification as read
      await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('id', notification.id);

      onMarkAsRead(notification.id);
      setActionTaken('accepted');
      toast.success('Connection accepted! You can now message each other.');
    } catch (err) {
      console.error('Accept error:', err);
      toast.error('Failed to accept connection.');
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline(e: React.MouseEvent) {
    e.stopPropagation();
    if (!requesterId) return;
    setDeclining(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Update connection status to declined
      const { error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('connections') as any)
        .update({ status: 'declined' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', session.user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Mark notification as read
      await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('id', notification.id);

      onMarkAsRead(notification.id);
      setActionTaken('declined');
      toast.success('Connection request declined.');
    } catch (err) {
      console.error('Decline error:', err);
      toast.error('Failed to decline connection.');
    } finally {
      setDeclining(false);
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-4 py-3.5 text-left transition-all duration-150 cursor-pointer',
        'hover:bg-accent/50',
        !notification.is_read && 'bg-primary/[0.04] dark:bg-primary/[0.06]'
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
          actionTaken === 'accepted'
            ? 'text-green-500 bg-green-500/10'
            : actionTaken === 'declined'
              ? 'text-muted-foreground bg-muted'
              : colorClasses
        )}
      >
        {actionTaken === 'accepted' ? (
          <UserCheck className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
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

        {/* Accept/Decline actions for connection requests */}
        {isConnectionRequest && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              className="h-7 text-xs gap-1 px-3"
              onClick={handleAccept}
              disabled={accepting || declining}
            >
              {accepting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 px-3"
              onClick={handleDecline}
              disabled={accepting || declining}
            >
              {declining ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Decline
            </Button>
          </div>
        )}

        {/* Show action taken state */}
        {actionTaken === 'accepted' && (
          <p className="mt-1.5 text-xs font-medium text-green-600">
            Connection accepted
          </p>
        )}
        {actionTaken === 'declined' && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Request declined
          </p>
        )}

        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </div>
  );
}
