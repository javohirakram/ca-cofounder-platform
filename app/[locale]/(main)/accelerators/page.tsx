import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { AcceleratorCard } from '@/components/accelerators/AcceleratorCard';
import { Building2 } from 'lucide-react';
import type { Accelerator } from '@/types/database';

interface AcceleratorWithCount extends Accelerator {
  member_count: number;
}

export default async function AcceleratorsPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('accelerators');
  const supabase = createServerSupabaseClient();

  // Fetch all active accelerators
  const { data: accelerators } = await supabase
    .from('accelerators')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const allAccelerators = (accelerators ?? []) as Accelerator[];

  // Fetch member counts for each accelerator
  const acceleratorIds = allAccelerators.map((a) => a.id);
  const memberCounts: Record<string, number> = {};

  if (acceleratorIds.length > 0) {
    const { data: members } = await supabase
      .from('accelerator_members')
      .select('accelerator_id')
      .in('accelerator_id', acceleratorIds);

    if (members) {
      for (const m of members as { accelerator_id: string }[]) {
        memberCounts[m.accelerator_id] =
          (memberCounts[m.accelerator_id] || 0) + 1;
      }
    }
  }

  const acceleratorsWithCounts: AcceleratorWithCount[] = allAccelerators.map(
    (acc) => ({
      ...acc,
      member_count: memberCounts[acc.id] || 0,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      {acceleratorsWithCounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {acceleratorsWithCounts.map((accelerator) => (
            <AcceleratorCard
              key={accelerator.id}
              accelerator={accelerator}
              memberCount={accelerator.member_count}
              locale={params.locale}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="No accelerators yet"
          description="Accelerator programs will appear here once they are added."
        />
      )}
    </div>
  );
}
