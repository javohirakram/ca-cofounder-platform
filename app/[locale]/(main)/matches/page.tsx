import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { MatchesList } from '@/components/matches/MatchesList';
import type { Profile, Match } from '@/types/database';

export interface MatchWithProfile {
  match: Match;
  profile: Profile;
}

export default async function MatchesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('matches');
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const userId = session.user.id;

  // Fetch matches where the current user is user_a or user_b
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('score', { ascending: false });

  const allMatches = (matches as Match[]) ?? [];

  // Collect other user IDs
  const otherUserIds = allMatches.map((m) =>
    m.user_a === userId ? m.user_b : m.user_a
  );

  // Fetch profiles for matched users
  const profilesMap: Record<string, Profile> = {};
  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    if (profiles) {
      for (const p of profiles as Profile[]) {
        profilesMap[p.id] = p;
      }
    }
  }

  // Combine matches with profiles
  const matchesWithProfiles: MatchWithProfile[] = allMatches
    .map((m) => {
      const otherId = m.user_a === userId ? m.user_b : m.user_a;
      const profile = profilesMap[otherId];
      if (!profile) return null;
      return { match: m, profile };
    })
    .filter((m): m is MatchWithProfile => m !== null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      />

      <MatchesList
        initialMatches={matchesWithProfiles}
        userId={userId}
      />
    </div>
  );
}
