'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConnectModal } from '@/components/discover/ConnectModal';
import { MatchCard } from '@/components/matches/MatchCard';
import {
  RefreshCw,
  Users,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import type { Profile, Match } from '@/types/database';

interface MatchWithProfile {
  match: Match;
  profile: Profile;
}

interface MatchesListProps {
  initialMatches: MatchWithProfile[];
  userId: string;
}

export function MatchesList({ initialMatches, userId }: MatchesListProps) {
  const t = useTranslations('matches');

  const [matches, setMatches] = useState<MatchWithProfile[]>(initialMatches);
  const [refreshing, setRefreshing] = useState(false);
  const [connectProfile, setConnectProfile] = useState<Profile | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Derive active and passed matches
  const activeMatches = matches.filter((m) => m.match.status !== 'passed');
  const passedMatches = matches.filter((m) => m.match.status === 'passed');

  // Find the most recent last_computed_at
  const lastComputed = matches.length > 0
    ? matches.reduce((latest, m) => {
        const time = new Date(m.match.last_computed_at).getTime();
        return time > latest ? time : latest;
      }, 0)
    : null;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const supabase = createClient();

      // Re-fetch matches
      const { data: rawMatches } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order('score', { ascending: false });

      const freshMatches = (rawMatches as Match[] | null) ?? [];

      if (freshMatches.length === 0) {
        setMatches([]);
        return;
      }

      const otherUserIds = freshMatches.map((m) =>
        m.user_a === userId ? m.user_b : m.user_a
      );

      const { data: rawProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', otherUserIds);

      const profilesMap: Record<string, Profile> = {};
      if (rawProfiles) {
        for (const p of rawProfiles as Profile[]) {
          profilesMap[p.id] = p;
        }
      }

      const updated: MatchWithProfile[] = freshMatches
        .map((m) => {
          const otherId = m.user_a === userId ? m.user_b : m.user_a;
          const profile = profilesMap[otherId];
          if (!profile) return null;
          return { match: m, profile };
        })
        .filter((m): m is MatchWithProfile => m !== null);

      setMatches(updated);
    } catch (err) {
      console.error('Error refreshing matches:', err);
    } finally {
      setRefreshing(false);
    }
  }

  async function handlePass(matchId: string) {
    try {
      const supabase = createClient();
      await supabase
        .from('matches')
        .update({ status: 'passed' } as never)
        .eq('id', matchId);

      setMatches((prev) =>
        prev.map((m) =>
          m.match.id === matchId
            ? { ...m, match: { ...m.match, status: 'passed' } }
            : m
        )
      );
    } catch (err) {
      console.error('Error passing match:', err);
    }
  }

  async function handleUndo(matchId: string) {
    try {
      const supabase = createClient();
      await supabase
        .from('matches')
        .update({ status: 'active' } as never)
        .eq('id', matchId);

      setMatches((prev) =>
        prev.map((m) =>
          m.match.id === matchId
            ? { ...m, match: { ...m.match, status: 'active' } }
            : m
        )
      );
    } catch (err) {
      console.error('Error undoing pass:', err);
    }
  }

  return (
    <div className="space-y-5">
      {/* Refresh row + info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2 w-fit"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshing ? t('refreshing') : t('refreshMatches')}
        </Button>

        {lastComputed && (
          <p className="text-xs text-muted-foreground">
            {t('lastComputed', {
              time: formatRelativeTime(new Date(lastComputed)),
            })}
          </p>
        )}
      </div>

      {/* How matching works - collapsible */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {t('howMatchingWorks')}
            </span>
          </div>
          {infoExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {infoExpanded && (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('matchingExplanation')}
            </p>
          </div>
        )}
      </div>

      {/* Tabs: Active / Passed */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="gap-1.5">
            {t('active')}
            {activeMatches.length > 0 && (
              <span className="text-[10px] font-medium bg-primary/10 text-primary rounded-full px-1.5 py-0.5 leading-none">
                {activeMatches.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="passed" className="gap-1.5">
            {t('passed')}
            {passedMatches.length > 0 && (
              <span className="text-[10px] font-medium bg-muted-foreground/10 text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
                {passedMatches.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeMatches.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title={t('noMatches')}
              description={t('completeProfile')}
            />
          ) : (
            <div className="space-y-3 mt-4">
              {activeMatches.map((m) => (
                <MatchCard
                  key={m.match.id}
                  match={m.match}
                  profile={m.profile}
                  onConnect={(profile) => setConnectProfile(profile)}
                  onPass={handlePass}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="passed">
          {passedMatches.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title={t('noPassedMatches')}
              description={t('passedTab')}
            />
          ) : (
            <div className="space-y-3 mt-4">
              {passedMatches.map((m) => (
                <MatchCard
                  key={m.match.id}
                  match={m.match}
                  profile={m.profile}
                  onConnect={(profile) => setConnectProfile(profile)}
                  onPass={handlePass}
                  onUndo={handleUndo}
                  isPassed
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Modal */}
      <ConnectModal
        profile={connectProfile}
        open={connectProfile !== null}
        onOpenChange={(open) => {
          if (!open) setConnectProfile(null);
        }}
      />
    </div>
  );
}
