'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NotificationsError({ error, reset }: ErrorProps) {
  const t = useTranslations('notifications');

  useEffect(() => {
    console.error('Notifications page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t('errorLoading')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {error.message || 'An unexpected error occurred while loading notifications.'}
      </p>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RotateCcw className="h-4 w-4" />
        {t('tryAgain')}
      </Button>
    </div>
  );
}
