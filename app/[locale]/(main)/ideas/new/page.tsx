'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/PageHeader';
import { IdeaForm } from '@/components/ideas/IdeaForm';
import { ArrowLeft } from 'lucide-react';

export default function NewIdeaPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('ideas');
  const tCommon = useTranslations('common');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/${locale}/ideas`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      <PageHeader title={t('postIdea')} />

      <IdeaForm />
    </div>
  );
}
