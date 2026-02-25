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
    if (processed.current) return;
    processed.current = true;

    async function processAuth() {
      let authData: Record<string, string> = {};

      // Method 1: Check URL query parameters (from data-auth-url widget redirect)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('id') && urlParams.get('hash')) {
        urlParams.forEach((value, key) => {
          authData[key] = value;
        });
      }

      // Method 2: Check hash fragment (from direct oauth.telegram.org redirect)
      // Format: #tgAuthResult=BASE64_JSON
      if (!authData.id) {
        const hash = window.location.hash;
        if (hash.startsWith('#tgAuthResult=')) {
          try {
            const base64 = hash.slice('#tgAuthResult='.length);
            authData = JSON.parse(atob(base64));
          } catch {
            setError('Failed to decode Telegram authentication data.');
            return;
          }
        }
      }

      // Validate we have required fields
      if (!authData.id || !authData.hash || !authData.auth_date) {
        setError('Missing authentication data from Telegram. Please try again.');
        return;
      }

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
            setError('Failed to create session. Please try again.');
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
