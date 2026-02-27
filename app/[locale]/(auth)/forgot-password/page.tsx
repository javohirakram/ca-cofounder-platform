'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/${locale}/settings`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{t('forgotTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('resetSent')}</p>
        </div>
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">{t('forgotTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('forgotSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('sending')}</span>
            </>
          ) : (
            t('sendResetLink')
          )}
        </Button>
      </form>

      <p className="text-center">
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
