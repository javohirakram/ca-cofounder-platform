'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

export default function TelegramLoginButton({ label }: { label: string }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  const handleTelegramAuth = useCallback(
    async (user: TelegramUser) => {
      setIsLoading(true);
      try {
        // Send Telegram auth data to our API
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Telegram authentication failed');
          return;
        }

        // Use the token_hash to verify and create a session
        if (data.token_hash) {
          const supabase = createClient();
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: data.token_hash,
            type: 'magiclink',
          });

          if (verifyError) {
            toast.error('Failed to create session. Please try again.');
            console.error('OTP verification error:', verifyError);
            return;
          }
        }

        toast.success(data.isNewUser ? 'Welcome! Let\'s set up your profile.' : 'Welcome back!');
        router.push(`/${locale}${data.redirectUrl}`);
      } catch {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [locale, router]
  );

  useEffect(() => {
    if (!botUsername || !widgetRef.current) return;

    // Set the global callback
    window.onTelegramAuth = handleTelegramAuth;

    // Create the Telegram widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    // Clear any previous widget
    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
      widgetRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      delete (window as Partial<Window>).onTelegramAuth;
    };
  }, [botUsername, handleTelegramAuth]);

  // If bot username is not configured, show a disabled button
  if (!botUsername) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full border-[#54A9EB]/30 bg-[#54A9EB]/5 text-[#54A9EB] hover:bg-[#54A9EB]/10 hover:text-[#54A9EB]"
        size="lg"
        disabled
      >
        <Send className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    );
  }

  // Show loading state when processing auth
  if (isLoading) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full border-[#54A9EB]/30 bg-[#54A9EB]/5 text-[#54A9EB]"
        size="lg"
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Signing in with Telegram...</span>
      </Button>
    );
  }

  // Render the Telegram widget container
  return (
    <div className="flex justify-center">
      <div ref={widgetRef} />
    </div>
  );
}
