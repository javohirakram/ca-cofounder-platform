'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Send, UserPlus } from 'lucide-react';
import type { Profile, ConnectionInsert, NotificationInsert } from '@/types/database';

const connectSchema = z.object({
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(300, 'Message must be at most 300 characters'),
});

interface ConnectModalProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectModal({ profile, open, onOpenChange }: ConnectModalProps) {
  const t = useTranslations('discover');
  const tCommon = useTranslations('common');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      // Reset state on close
      setMessage('');
      setError(null);
      setSent(false);
    }
    onOpenChange(isOpen);
  }

  async function handleSend() {
    setError(null);

    // Validate
    const result = connectSchema.safeParse({ message });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    if (!profile) return;

    setSending(true);
    try {
      const supabase = createClient();

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('You must be logged in to send a connection request.');
        return;
      }

      const requesterId = session.user.id;

      // Check for existing connection
      const { data: existing } = await supabase
        .from('connections')
        .select('id')
        .or(
          `and(requester_id.eq.${requesterId},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${requesterId})`
        )
        .maybeSingle();

      if (existing) {
        setError('A connection request already exists with this person.');
        return;
      }

      // Create connection request
      const connectionData: ConnectionInsert = {
        requester_id: requesterId,
        recipient_id: profile.id,
        message: message.trim(),
        status: 'pending',
      };

      const { error: connError } = await supabase
        .from('connections')
        .insert(connectionData as never);

      if (connError) throw connError;

      // Get requester profile for notification
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', requesterId)
        .single();

      const requesterName = (requesterProfile as { full_name: string | null } | null)?.full_name ?? 'Someone';

      // Create notification for recipient
      const notificationData: NotificationInsert = {
        user_id: profile.id,
        type: 'connection_request',
        title: `${requesterName} sent you a connection request`,
        body: message.trim(),
        link: `/profile/${requesterId}`,
      };

      await supabase.from('notifications').insert(notificationData as never);

      setSent(true);

      // Auto-close after brief success display
      setTimeout(() => {
        handleClose(false);
      }, 1500);
    } catch (err) {
      console.error('Connection request error:', err);
      setError('Failed to send connection request. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {t('connectTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('connectMessage')}
          </DialogDescription>
        </DialogHeader>

        {/* Profile preview */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ''} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {profile.full_name ? getInitials(profile.full_name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.full_name}
            </p>
            {profile.headline && (
              <p className="text-xs text-muted-foreground truncate">
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="connect-message">
            {t('connectMessage')}
          </Label>
          <Textarea
            id="connect-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t('connectPlaceholder')}
            rows={4}
            disabled={sending || sent}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <span />
            )}
            <p className="text-[11px] text-muted-foreground">
              {message.length}/300
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={sending}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || sent || message.trim().length < 20}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tCommon('send')}
              </>
            ) : sent ? (
              <>
                <Send className="h-4 w-4" />
                {tCommon('success')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t('sendRequest')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
