'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function IdeasError({ error, reset }: ErrorProps) {
  const t = useTranslations('common');

  return (
    <div className="py-12">
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8" />}
        title={t('error')}
        description={error.message || 'Failed to load ideas. Please try again.'}
        action={
          <Button onClick={reset} variant="outline" size="sm">
            Try Again
          </Button>
        }
      />
    </div>
  );
}
