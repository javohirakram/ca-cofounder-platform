import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { DiscoverContent } from '@/components/discover/DiscoverContent';
import type { Profile } from '@/types/database';

const PAGE_SIZE = 20;

export default async function DiscoverPage() {
  const t = await getTranslations('discover');
  const supabase = createServerSupabaseClient();

  // Fetch initial profiles where is_actively_looking = true
  const { data: profiles, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('is_actively_looking', true)
    .order('last_active', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  const initialProfiles: Profile[] = (profiles as Profile[]) ?? [];
  const totalCount = count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
      />

      <DiscoverContent
        initialProfiles={initialProfiles}
        initialTotal={totalCount}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
