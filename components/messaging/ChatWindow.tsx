'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { Send, Copy, ArrowLeft, MessageSquare } from 'lucide-react';
import type { Message, Profile } from '@/types/database';

interface ChatWindowProps {
  threadId: string | null;
  currentUserId: string;
  otherUser: Profile | null;
  currentUserProfile: Profile | null;
  onBack?: () => void;
}

export function ChatWindow({
  threadId,
  currentUserId,
  otherUser,
  currentUserProfile,
  onBack,
}: ChatWindowProps) {
  const t = useTranslations('messaging');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    let isCancelled = false;

    async function fetchMessages() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId!)
        .order('created_at', { ascending: true });

      if (!isCancelled) {
        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages((data as Message[]) ?? []);
        }
        setLoading(false);
      }
    }

    fetchMessages();

    return () => {
      isCancelled = true;
    };
  }, [threadId]);

  // Mark messages as read
  useEffect(() => {
    if (!threadId || !currentUserId || messages.length === 0) return;

    const unreadIds = messages
      .filter((m) => m.sender_id !== currentUserId && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    const supabase = createClient();
    supabase
      .from('messages')
      .update({ is_read: true } as never)
      .in('id', unreadIds)
      .then(({ error }) => {
        if (error) {
          console.error('Error marking messages as read:', error);
        }
      });
  }, [messages, threadId, currentUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!threadId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark as read if from other user
          if (newMsg.sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ is_read: true } as never)
              .eq('id', newMsg.id)
              .then(() => {});
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId]);

  async function handleSend() {
    if (!threadId || !newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const supabase = createClient();

      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: currentUserId,
          content,
          is_read: false,
        } as never);

      if (msgError) throw msgError;

      // Update thread's last_message_at
      await supabase
        .from('threads')
        .update({ last_message_at: new Date().toISOString() } as never)
        .eq('id', threadId);
    } catch (err) {
      console.error('Send message error:', err);
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleCopyTelegram() {
    if (otherUser?.telegram_handle) {
      navigator.clipboard.writeText(otherUser.telegram_handle);
    }
  }

  // Show both users' telegram handles
  const showTelegramButton =
    otherUser?.telegram_handle && currentUserProfile?.telegram_handle;

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t('noMessages')}</p>
          <p className="text-xs text-muted-foreground/60">{t('startConversation')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
        {/* Back button for mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {otherUser && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={otherUser.avatar_url ?? undefined}
                alt={otherUser.full_name ?? ''}
              />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {otherUser.full_name ? getInitials(otherUser.full_name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {otherUser.full_name}
              </p>
              {otherUser.headline && (
                <p className="text-[10px] text-muted-foreground truncate">
                  {otherUser.headline}
                </p>
              )}
            </div>
          </div>
        )}

        {showTelegramButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 shrink-0 text-muted-foreground"
            onClick={handleCopyTelegram}
          >
            <Copy className="h-3 w-3" />
            {t('copyTelegram')}
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-2">
          {loading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    i % 2 === 0 ? 'justify-start' : 'justify-end'
                  )}
                >
                  <div
                    className={cn(
                      'h-10 rounded-2xl bg-muted animate-pulse',
                      i % 2 === 0 ? 'w-48 rounded-bl-sm' : 'w-40 rounded-br-sm'
                    )}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xs text-muted-foreground">{t('noMessages')}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                timestamp={msg.created_at}
                isSent={msg.sender_id === currentUserId}
                isRead={msg.is_read}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t shrink-0">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeMessage')}
            className="h-10 text-sm"
            disabled={sending}
          />
          <Button
            size="sm"
            className="h-10 px-3 shrink-0"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">{t('sendMessage')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
