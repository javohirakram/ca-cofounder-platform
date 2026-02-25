'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TelegramCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    // Prevent double-processing in React strict mode
    if (processed.current) return;
    processed.current = true;

    async function processAuth() {
      // Read auth data from URL query parameters (sent by Telegram's data-auth-url redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      const hash = urlParams.get('hash');
      const auth_date = urlParams.get('auth_date');

      if (!id || !hash || !auth_date) {
        setError('Missing authentication data from Telegram.');
        return;
      }

      // Build the auth payload
      const authData: Record<string, string> = { id, hash, auth_date };
      const first_name = urlParams.get('first_name');
      const last_name = urlParams.get('last_name');
      const username = urlParams.get('username');
      const photo_url = urlParams.get('photo_url');

      if (first_name) authData.first_name = first_name;
      if (last_name) authData.last_name = last_name;
      if (username) authData.username = username;
      if (photo_url) authData.photo_url = photo_url;

      try {
        // Send to our API for verification and user creation
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Telegram authentication failed.');
          return;
        }

        // Use the token_hash to create a Supabase session
        if (data.token_hash) {
          const supabase = createClient();
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: data.token_hash,
            type: 'magiclink',
          });

          if (verifyError) {
            console.error('OTP verification error:', verifyError);
            setError('Failed to create session. Please try logging in again.');
            return;
          }
        }

        // Redirect to the appropriate page
        router.push(`/${locale}${data.redirectUrl}`);
      } catch (err) {
        console.error('Telegram callback error:', err);
        setError('Something went wrong. Please try again.');
      }
    }

    processAuth();
  }, [locale, router]);

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-destructive">
            Authentication Failed
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/login`}>Back to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Signing in with Telegram...
        </h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we verify your identity.
        </p>
      </div>
    </div>
  );
}
