import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { DiscoverContent } from '@/components/discover/DiscoverContent';
import type { Profile, Match } from '@/types/database';

const PAGE_SIZE = 20;

export interface MatchWithProfile {
  match: Match;
  profile: Profile;
}

export default async function DiscoverPage() {
  const t = await getTranslations('discover');
  const supabase = createServerSupabaseClient();

  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id ?? null;

  // Fetch initial browse profiles (is_actively_looking = true, exclude self)
  let browseQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('is_actively_looking', true)
    .order('last_active', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (currentUserId) {
    browseQuery = browseQuery.neq('id', currentUserId);
  }

  const { data: profiles, count } = await browseQuery;

  const initialProfiles: Profile[] = (profiles as Profile[]) ?? [];
  const totalCount = count ?? 0;

  // Fetch current user's profile (for match reasons generation)
  let currentProfile: Profile | null = null;
  let initialMatches: MatchWithProfile[] = [];

  if (currentUserId) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();

    currentProfile = profileData as Profile | null;

    // Fetch pre-computed matches (non-passed, ordered by score)
    const { data: matchRows } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
      .neq('status', 'passed')
      .order('score', { ascending: false })
      .limit(12);

    const allMatchRows = (matchRows as Match[]) ?? [];

    if (allMatchRows.length > 0) {
      const matchProfileIds = allMatchRows
        .map((m) => (m.user_a === currentUserId ? m.user_b : m.user_a))
        .filter(Boolean);

      const { data: matchProfilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', matchProfileIds);

      const profileMap: Record<string, Profile> = {};
      for (const p of (matchProfilesData as Profile[]) ?? []) {
        profileMap[p.id] = p;
      }

      initialMatches = allMatchRows
        .map((m) => {
          const otherId = m.user_a === currentUserId ? m.user_b : m.user_a;
          const profile = profileMap[otherId];
          if (!profile) return null;
          return { match: m, profile };
        })
        .filter((m): m is MatchWithProfile => m !== null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <DiscoverContent
        initialProfiles={initialProfiles}
        initialTotal={totalCount}
        pageSize={PAGE_SIZE}
        currentUserId={currentUserId}
        currentProfile={currentProfile}
        initialMatches={initialMatches}
      />
    </div>
  );
}
