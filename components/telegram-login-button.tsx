'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TelegramLoginButton({ label }: { label: string }) {
  const params = useParams();
  const locale = params.locale as string;
  const widgetRef = useRef<HTMLDivElement>(null);
  const [showFallback, setShowFallback] = useState(false);
  const loadedRef = useRef(false);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername || !widgetRef.current) return;

    const callbackUrl = `${window.location.origin}/${locale}/telegram-callback`;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', callbackUrl);
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    script.onload = () => {
      loadedRef.current = true;
    };

    script.onerror = () => {
      setShowFallback(true);
    };

    const container = widgetRef.current;
    container.innerHTML = '';
    container.appendChild(script);

    // If widget doesn't render in 5s, show fallback
    const timeout = setTimeout(() => {
      if (!loadedRef.current) {
        setShowFallback(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [botUsername, locale]);

  if (!botUsername || showFallback) {
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

  return (
    <div className="flex justify-center min-h-[40px]">
      <div ref={widgetRef} />
    </div>
  );
}
