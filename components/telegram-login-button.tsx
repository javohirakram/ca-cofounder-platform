'use client';

import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Bot ID extracted from the public bot token (first part before ':')
// This is public info — same as the bot username cofound_ca_bot
const TELEGRAM_BOT_ID = '8728709473';

export default function TelegramLoginButton({ label }: { label: string }) {
  const params = useParams();
  const locale = params.locale as string;

  function handleClick() {
    const origin = window.location.origin;
    const callbackUrl = `${origin}/${locale}/telegram-callback`;

    // Redirect to Telegram's OAuth page directly
    window.location.href =
      `https://oauth.telegram.org/auth` +
      `?bot_id=${TELEGRAM_BOT_ID}` +
      `&origin=${encodeURIComponent(origin)}` +
      `&embed=0` +
      `&request_access=write` +
      `&return_to=${encodeURIComponent(callbackUrl)}`;
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-[#54A9EB]/30 bg-[#54A9EB]/5 text-[#54A9EB] hover:bg-[#54A9EB]/10 hover:text-[#54A9EB]"
      size="lg"
      onClick={handleClick}
    >
      <Send className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
