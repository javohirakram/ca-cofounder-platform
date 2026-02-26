'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { FilterSidebar, type DiscoverFilters } from '@/components/discover/FilterSidebar';
import { FounderGrid } from '@/components/discover/FounderGrid';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Search, Users, X } from 'lucide-react';
import type { Profile } from '@/types/database';

interface DiscoverContentProps {
  initialProfiles: Profile[];
  initialTotal: number;
  pageSize: number;
  currentUserId?: string | null;
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
}: DiscoverContentProps) {
  const t = useTranslations('discover');
  const tCommon = useTranslations('common');

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const fetchProfiles = useCallback(
    async (
      searchQuery: string,
      currentFilters: DiscoverFilters,
      pageNum: number,
      append: boolean
    ) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const supabase = createClient();

        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('is_actively_looking', true)
          .order('last_active', { ascending: false });

        // Search across name, headline, bio, skills
        if (searchQuery.trim()) {
          const term = `%${searchQuery.trim()}%`;
          query = query.or(
            `full_name.ilike.${term},headline.ilike.${term},bio.ilike.${term},skills.cs.{${searchQuery.trim()}}`
          );
        }

        // Apply filters
        if (currentFilters.countries.length > 0) {
          query = query.in('country', currentFilters.countries);
        }

        if (currentFilters.roles.length > 0) {
          query = query.overlaps('role', currentFilters.roles);
        }

        if (currentFilters.industries.length > 0) {
          query = query.overlaps('industries', currentFilters.industries);
        }

        if (currentFilters.commitment && currentFilters.commitment !== 'any') {
          query = query.eq('commitment', currentFilters.commitment);
        }

        if (currentFilters.idea_stages.length > 0) {
          query = query.in('idea_stage', currentFilters.idea_stages);
        }

        if (currentFilters.languages.length > 0) {
          query = query.overlaps('languages', currentFilters.languages);
        }

        if (currentFilters.ecosystem_tags.length > 0) {
          query = query.overlaps('ecosystem_tags', currentFilters.ecosystem_tags);
        }

        if (currentFilters.actively_looking) {
          query = query.eq('is_actively_looking', true);
        }

        // Pagination
        const from = pageNum * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }

        const fetched = (data as Profile[]) ?? [];
        const totalCount = count ?? 0;

        if (append) {
          setProfiles((prev) => [...prev, ...fetched]);
        } else {
          setProfiles(fetched);
        }
        setTotal(totalCount);
      } catch (err) {
        console.error('Unexpected error fetching profiles:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize]
  );

  // Debounced search effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setPage(0);
      fetchProfiles(search, filters, 0, false);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
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

  const hasMore = profiles.length < total;

  // Build active filter chips
  function getActiveChips(): { key: string; label: string; onRemove: () => void }[] {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    for (const c of filters.countries) {
      chips.push({
        key: `country-${c}`,
        label: c,
        onRemove: () => handleFilterChange({ ...filters, countries: filters.countries.filter((v) => v !== c) }),
      });
    }
    for (const r of filters.roles) {
      chips.push({
        key: `role-${r}`,
        label: r,
        onRemove: () => handleFilterChange({ ...filters, roles: filters.roles.filter((v) => v !== r) }),
      });
    }
    for (const ind of filters.industries) {
      chips.push({
        key: `industry-${ind}`,
        label: ind,
        onRemove: () => handleFilterChange({ ...filters, industries: filters.industries.filter((v) => v !== ind) }),
      });
    }
    if (filters.commitment && filters.commitment !== 'any') {
      chips.push({
        key: `commitment-${filters.commitment}`,
        label: filters.commitment.replace('_', ' '),
        onRemove: () => handleFilterChange({ ...filters, commitment: 'any' }),
      });
    }
    for (const s of filters.idea_stages) {
      chips.push({
        key: `stage-${s}`,
        label: s.replace(/_/g, ' '),
        onRemove: () => handleFilterChange({ ...filters, idea_stages: filters.idea_stages.filter((v) => v !== s) }),
      });
    }
    for (const l of filters.languages) {
      chips.push({
        key: `lang-${l}`,
        label: l,
        onRemove: () => handleFilterChange({ ...filters, languages: filters.languages.filter((v) => v !== l) }),
      });
    }
    for (const tag of filters.ecosystem_tags) {
      chips.push({
        key: `eco-${tag}`,
        label: tag,
        onRemove: () => handleFilterChange({ ...filters, ecosystem_tags: filters.ecosystem_tags.filter((v) => v !== tag) }),
      });
    }
    return chips;
  }

  const activeChips = getActiveChips();

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-10 h-10"
        />
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">{t('filterBy')}:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal capitalize cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={chip.onRemove}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <button
            onClick={() => handleFilterChange(defaultFilters)}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-1 underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile filter button */}
      <div className="lg:hidden">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {tCommon('loading')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-card p-6 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-5 w-16 bg-muted rounded-full" />
                      <div className="h-5 w-20 bg-muted rounded-full" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-9 flex-1 bg-muted rounded-md" />
                      <div className="h-9 flex-1 bg-muted rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
