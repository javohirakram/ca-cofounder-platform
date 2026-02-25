'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
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
import { Loader2, HandHelping, Send } from 'lucide-react';
import type { Idea, IdeaInterestInsert, NotificationInsert } from '@/types/database';

interface InterestedModalProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterestedModal({ idea, open, onOpenChange }: InterestedModalProps) {
  const t = useTranslations('ideas');
  const tCommon = useTranslations('common');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      setMessage('');
      setError(null);
      setSent(false);
    }
    onOpenChange(isOpen);
  }

  async function handleSend() {
    if (!idea) return;
    setError(null);
    setSending(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('You must be logged in to express interest.');
        return;
      }

      const userId = session.user.id;

      // Check for existing interest
      const { data: existing } = await supabase
        .from('idea_interests')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        setError('You have already expressed interest in this idea.');
        return;
      }

      // Create interest record
      const interestData: IdeaInterestInsert = {
        idea_id: idea.id,
        user_id: userId,
        message: message.trim() || null,
      };

      const { error: insertError } = await supabase
        .from('idea_interests')
        .insert(interestData as never);

      if (insertError) throw insertError;

      // Get user profile for notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const userName = (userProfile as { full_name: string | null } | null)?.full_name ?? 'Someone';

      // Create notification for idea author
      const notificationData: NotificationInsert = {
        user_id: idea.author_id,
        type: 'idea_interest',
        title: `${userName} is interested in your idea "${idea.title}"`,
        body: message.trim() || null,
        link: `/ideas/${idea.id}`,
      };

      await supabase.from('notifications').insert(notificationData as never);

      setSent(true);

      setTimeout(() => {
        handleClose(false);
      }, 1500);
    } catch (err) {
      console.error('Interest error:', err);
      setError('Failed to submit interest. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (!idea) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandHelping className="h-5 w-5 text-primary" />
            {t('interestedTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('interestedMessage')}
          </DialogDescription>
        </DialogHeader>

        {/* Idea preview */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {idea.title}
          </p>
          {idea.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {idea.description}
            </p>
          )}
        </div>

        {/* Optional message */}
        <div className="space-y-2">
          <Label htmlFor="interest-message">
            {t('interestedMessage')}
          </Label>
          <Textarea
            id="interest-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(null);
            }}
            placeholder="I'd love to work on this because..."
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
              {message.length}/500
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
            disabled={sending || sent}
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
                {tCommon('submit')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
