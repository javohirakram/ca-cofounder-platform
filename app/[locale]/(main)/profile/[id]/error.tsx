'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ErrorProps) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8" />}
        title={t('error')}
        description={error.message || 'Failed to load this profile. Please try again.'}
        action={
          <Button onClick={reset} variant="outline" size="sm">
            Try Again
          </Button>
        }
      />
    </div>
  );
}
