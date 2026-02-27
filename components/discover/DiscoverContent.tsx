'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { generateMatchReasons } from '@/lib/matching';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterSidebar, type DiscoverFilters } from '@/components/discover/FilterSidebar';
import { DiscoverMatchCard, DiscoverMatchCardSkeleton } from '@/components/discover/DiscoverMatchCard';
import { FounderGrid } from '@/components/discover/FounderGrid';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConnectModal } from '@/components/discover/ConnectModal';
import { Search, Sparkles, Users, X, RefreshCw, Loader2 } from 'lucide-react';
import type { Profile, Match, Connection } from '@/types/database';
import type { MatchWithProfile } from '@/app/[locale]/(main)/discover/page';

interface DiscoverContentProps {
  initialProfiles: Profile[];
  initialTotal: number;
  pageSize: number;
  currentUserId?: string | null;
  currentProfile?: Profile | null;
  initialMatches: MatchWithProfile[];
}

const defaultFilters: DiscoverFilters = {
  countries: [],
  roles: [],
  industries: [],
  commitment: 'any',
  idea_stages: [],
  languages: [],
  ecosystem_tags: [],
  actively_looking: false,
};

export function DiscoverContent({
  initialProfiles,
  initialTotal,
  pageSize,
  currentUserId,
  currentProfile,
  initialMatches,
}: DiscoverContentProps) {
  const t = useTranslations('discover');
  const tCommon = useTranslations('common');

  // ── For You tab ────────────────────────────────────────────────────────────
  const [matches, setMatches] = useState<MatchWithProfile[]>(initialMatches);
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [connectProfile, setConnectProfile] = useState<Profile | null>(null);

  // ── Browse tab ─────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Shared: connection statuses ────────────────────────────────────────────
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'pending' | 'connected'>>({});

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Fetch connection statuses on mount
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    supabase
      .from('connections')
      .select('requester_id, recipient_id, status')
      .or(`requester_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .then(({ data }) => {
        if (!data) return;
        const statuses: Record<string, 'pending' | 'connected'> = {};
        for (const conn of data as Pick<Connection, 'requester_id' | 'recipient_id' | 'status'>[]) {
          const otherId = conn.requester_id === currentUserId ? conn.recipient_id : conn.requester_id;
          statuses[otherId] = conn.status === 'accepted' ? 'connected' : 'pending';
        }
        setConnectionStatuses(statuses);
      });
  }, [currentUserId]);

  function handleConnected(profileId: string) {
    setConnectionStatuses((prev) => ({ ...prev, [profileId]: 'pending' }));
  }

  // ── Browse: fetch profiles ─────────────────────────────────────────────────
  const fetchProfiles = useCallback(
    async (searchQuery: string, currentFilters: DiscoverFilters, pageNum: number, append: boolean) => {
      append ? setLoadingMore(true) : setLoadingBrowse(true);
      try {
        const supabase = createClient();
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('is_actively_looking', true)
          .order('last_active', { ascending: false });

        if (currentUserId) query = query.neq('id', currentUserId);

        if (searchQuery.trim()) {
          const term = `%${searchQuery.trim()}%`;
          query = query.or(`full_name.ilike.${term},headline.ilike.${term},bio.ilike.${term},skills.cs.{${searchQuery.trim()}}`);
        }
        if (currentFilters.countries.length > 0) query = query.in('country', currentFilters.countries);
        if (currentFilters.roles.length > 0) query = query.overlaps('role', currentFilters.roles);
        if (currentFilters.industries.length > 0) query = query.overlaps('industries', currentFilters.industries);
        if (currentFilters.commitment && currentFilters.commitment !== 'any') query = query.eq('commitment', currentFilters.commitment);
        if (currentFilters.idea_stages.length > 0) query = query.in('idea_stage', currentFilters.idea_stages);
        if (currentFilters.languages.length > 0) query = query.overlaps('languages', currentFilters.languages);
        if (currentFilters.ecosystem_tags.length > 0) query = query.overlaps('ecosystem_tags', currentFilters.ecosystem_tags);

        const from = pageNum * pageSize;
        query = query.range(from, from + pageSize - 1);

        const { data, count, error } = await query;
        if (error) { console.error('Browse fetch error:', error); return; }

        const fetched = (data as Profile[]) ?? [];
        append ? setProfiles((prev) => [...prev, ...fetched]) : setProfiles(fetched);
        setTotal(count ?? 0);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoadingBrowse(false);
        setLoadingMore(false);
      }
    },
    [pageSize, currentUserId]
  );

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(0);
      fetchProfiles(search, filters, 0, false);
    }, 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search, filters, fetchProfiles]);

  function handleFilterChange(newFilters: DiscoverFilters) {
    setFilters(newFilters);
    setPage(0);
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProfiles(search, filters, nextPage, true);
  }

  // ── For You: pass ─────────────────────────────────────────────────────────
  async function handlePass(matchId: string) {
    try {
      const supabase = createClient();
      await supabase.from('matches').update({ status: 'passed' } as never).eq('id', matchId);
      setMatches((prev) => prev.filter((m) => m.match.id !== matchId));
    } catch (err) {
      console.error('Pass error:', err);
    }
  }

  // ── For You: refresh ──────────────────────────────────────────────────────
  async function handleRefreshMatches() {
    if (!currentUserId) return;
    setRefreshingMatches(true);
    try {
      await fetch('/api/matches');
      const supabase = createClient();
      const { data: matchRows } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
        .neq('status', 'passed')
        .order('score', { ascending: false })
        .limit(12);

      const allMatchRows = (matchRows as Match[]) ?? [];
      if (allMatchRows.length === 0) { setMatches([]); return; }

      const matchProfileIds = allMatchRows.map((m) =>
        m.user_a === currentUserId ? m.user_b : m.user_a
      );
      const { data: matchProfilesData } = await supabase
        .from('profiles').select('*').in('id', matchProfileIds);

      const profileMap: Record<string, Profile> = {};
      for (const p of (matchProfilesData as Profile[]) ?? []) profileMap[p.id] = p;

      const updated: MatchWithProfile[] = allMatchRows
        .map((m) => {
          const otherId = m.user_a === currentUserId ? m.user_b : m.user_a;
          const profile = profileMap[otherId];
          if (!profile) return null;
          return { match: m, profile };
        })
        .filter((m): m is MatchWithProfile => m !== null);

      setMatches(updated);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshingMatches(false);
    }
  }

  // ── Active filter chips ───────────────────────────────────────────────────
  function getActiveChips() {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    for (const c of filters.countries) chips.push({ key: `country-${c}`, label: c, onRemove: () => handleFilterChange({ ...filters, countries: filters.countries.filter((v) => v !== c) }) });
    for (const r of filters.roles) chips.push({ key: `role-${r}`, label: r, onRemove: () => handleFilterChange({ ...filters, roles: filters.roles.filter((v) => v !== r) }) });
    for (const ind of filters.industries) chips.push({ key: `ind-${ind}`, label: ind, onRemove: () => handleFilterChange({ ...filters, industries: filters.industries.filter((v) => v !== ind) }) });
    if (filters.commitment && filters.commitment !== 'any') chips.push({ key: `com`, label: filters.commitment.replace('_', ' '), onRemove: () => handleFilterChange({ ...filters, commitment: 'any' }) });
    for (const s of filters.idea_stages) chips.push({ key: `stage-${s}`, label: s.replace(/_/g, ' '), onRemove: () => handleFilterChange({ ...filters, idea_stages: filters.idea_stages.filter((v) => v !== s) }) });
    for (const l of filters.languages) chips.push({ key: `lang-${l}`, label: l, onRemove: () => handleFilterChange({ ...filters, languages: filters.languages.filter((v) => v !== l) }) });
    for (const tag of filters.ecosystem_tags) chips.push({ key: `eco-${tag}`, label: tag, onRemove: () => handleFilterChange({ ...filters, ecosystem_tags: filters.ecosystem_tags.filter((v) => v !== tag) }) });
    return chips;
  }

  const activeChips = getActiveChips();
  const hasMore = profiles.length < total;

  return (
    <Tabs defaultValue="for-you" className="space-y-0">
      {/* ── Tab bar ── */}
      <TabsList className="h-9 p-1 bg-muted/60 mb-6">
        <TabsTrigger value="for-you" className="gap-1.5 text-xs h-7 px-3 data-[state=active]:bg-background">
          <Sparkles className="h-3.5 w-3.5" />
          {t('forYouTab')}
        </TabsTrigger>
        <TabsTrigger value="browse" className="text-xs h-7 px-3 data-[state=active]:bg-background">
          <Users className="h-3.5 w-3.5 mr-1.5" />
          {t('browseTab')}
        </TabsTrigger>
      </TabsList>

      {/* ══ FOR YOU ══════════════════════════════════════════════════════════ */}
      <TabsContent value="for-you" className="mt-0 space-y-5">
        {matches.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title={t('noTopMatches')}
            description={t('noTopMatchesDesc')}
            action={
              currentUserId ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshMatches}
                  disabled={refreshingMatches}
                  className="gap-2"
                >
                  {refreshingMatches ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {t('refreshMatches')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('showingMatches', { count: matches.length })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshMatches}
                disabled={refreshingMatches}
                className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                {refreshingMatches ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {t('refreshMatches')}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map(({ match, profile }) => {
                const reasons = currentProfile ? generateMatchReasons(currentProfile, profile) : [];
                return (
                  <DiscoverMatchCard
                    key={match.id}
                    profile={profile}
                    score={match.score}
                    reasons={reasons}
                    matchId={match.id}
                    connectionStatus={connectionStatuses[profile.id] ?? 'none'}
                    onConnect={(p) => setConnectProfile(p)}
                    onPass={handlePass}
                  />
                );
              })}
            </div>
          </>
        )}
      </TabsContent>

      {/* ══ BROWSE ═══════════════════════════════════════════════════════════ */}
      <TabsContent value="browse" className="mt-0 space-y-4">
        {/* Search + compact filter trigger */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9 h-9"
            />
          </div>
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} compact />
        </div>

        {/* Active chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t('filterBy')}:</span>
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="gap-1 pr-1.5 text-xs font-normal capitalize cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={chip.onRemove}
              >
                {chip.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <button
              onClick={() => handleFilterChange(defaultFilters)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Full-width grid — filters live in the Sheet only */}
        <div>
          {loadingBrowse ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <DiscoverMatchCardSkeleton key={i} />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title={tCommon('noResults')}
              description={
                search
                  ? `No profiles found matching "${search}"`
                  : 'No profiles match your current filters. Try adjusting your criteria.'
              }
            />
          ) : (
            <FounderGrid
                profiles={profiles}
                total={total}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loadingMore}
                currentUserId={currentUserId}
                connectionStatuses={connectionStatuses}
                onConnected={handleConnected}
              />
            )}
        </div>
      </TabsContent>

      {/* Connect modal — shared */}
      <ConnectModal
        profile={connectProfile}
        open={connectProfile !== null}
        onOpenChange={(open) => { if (!open) setConnectProfile(null); }}
        onSuccess={(profileId) => {
          handleConnected(profileId);
          setConnectProfile(null);
        }}
      />
    </Tabs>
  );
}
