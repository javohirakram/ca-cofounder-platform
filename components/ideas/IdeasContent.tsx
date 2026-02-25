'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getCountryFlag } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { InterestedModal } from '@/components/ideas/InterestedModal';
import { Lightbulb, ArrowUpDown } from 'lucide-react';
import type { Idea, Profile } from '@/types/database';

type IdeaWithAuthor = Idea & { author?: Profile | null };

const INDUSTRIES = [
  'Fintech', 'Edtech', 'Healthtech', 'Agritech', 'E-commerce',
  'Logistics', 'AI/ML', 'SaaS', 'Marketplace', 'Social',
];

const STAGES = ['no_idea', 'have_idea', 'concept', 'prototype', 'side_project', 'early_traction'];

const COUNTRIES = [
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TM', label: 'Turkmenistan' },
];

type SortOption = 'newest' | 'upvoted' | 'views';

interface IdeasFilters {
  industry: string;
  stage: string;
  country: string;
  openOnly: boolean;
}

interface IdeasContentProps {
  initialIdeas: IdeaWithAuthor[];
  currentUserId?: string;
  userUpvotedIds: string[];
}

export function IdeasContent({
  initialIdeas,
  currentUserId,
  userUpvotedIds,
}: IdeasContentProps) {
  const t = useTranslations('ideas');
  const tCommon = useTranslations('common');
  const tStages = useTranslations('stages');

  const [ideas, setIdeas] = useState<IdeaWithAuthor[]>(initialIdeas);
  const [filters, setFilters] = useState<IdeasFilters>({
    industry: 'all',
    stage: 'all',
    country: 'all',
    openOnly: false,
  });
  const [sort, setSort] = useState<SortOption>('newest');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set(userUpvotedIds));
  const [loading, setLoading] = useState(false);
  const [interestedIdea, setInterestedIdea] = useState<Idea | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const fetchIdeas = useCallback(
    async (currentFilters: IdeasFilters, currentSort: SortOption) => {
      setLoading(true);
      try {
        const supabase = createClient();

        let query = supabase
          .from('ideas')
          .select('*, author:profiles!ideas_author_id_fkey(*)');

        if (currentFilters.industry && currentFilters.industry !== 'all') {
          query = query.contains('industries', [currentFilters.industry]);
        }

        if (currentFilters.stage && currentFilters.stage !== 'all') {
          query = query.eq('stage', currentFilters.stage);
        }

        if (currentFilters.country && currentFilters.country !== 'all') {
          query = query.contains('country_focus', [currentFilters.country]);
        }

        if (currentFilters.openOnly) {
          query = query.eq('is_open', true);
        }

        switch (currentSort) {
          case 'upvoted':
            query = query.order('upvotes', { ascending: false });
            break;
          case 'views':
            query = query.order('views', { ascending: false });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching ideas:', error);
          return;
        }

        const fetched = (data ?? []).map((item: Record<string, unknown>) => {
          const { author, ...rest } = item;
          return {
            ...rest,
            author: author ?? null,
          };
        }) as IdeaWithAuthor[];

        setIdeas(fetched);
      } catch (err) {
        console.error('Unexpected error fetching ideas:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchIdeas(filters, sort);
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters, sort, fetchIdeas]);

  function handleUpvote(ideaId: string) {
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Industry filter */}
        <Select
          value={filters.industry}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, industry: value }))}
        >
          <SelectTrigger className="h-9 w-[160px] text-xs">
            <SelectValue placeholder={t('filterByIndustry')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterByIndustry')}</SelectItem>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stage filter */}
        <Select
          value={filters.stage}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, stage: value }))}
        >
          <SelectTrigger className="h-9 w-[160px] text-xs">
            <SelectValue placeholder={t('filterByStage')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterByStage')}</SelectItem>
            {STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {tStages(stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Country filter */}
        <Select
          value={filters.country}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
        >
          <SelectTrigger className="h-9 w-[160px] text-xs">
            <SelectValue placeholder={t('filterByCountry')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterByCountry')}</SelectItem>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {getCountryFlag(country.value)} {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Open only toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="open-only"
            checked={filters.openOnly}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({ ...prev, openOnly: checked }))
            }
          />
          <Label htmlFor="open-only" className="text-xs font-medium cursor-pointer">
            {t('openOnly')}
          </Label>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortOption)}
          >
            <SelectTrigger className="h-9 w-[140px] text-xs border-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('sortNewest')}</SelectItem>
              <SelectItem value="upvoted">{t('sortUpvoted')}</SelectItem>
              <SelectItem value="views">{t('sortViewed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter badges */}
      {(filters.industry !== 'all' || filters.stage !== 'all' || filters.country !== 'all' || filters.openOnly) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.industry !== 'all' && (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/10"
              onClick={() => setFilters((prev) => ({ ...prev, industry: 'all' }))}
            >
              {filters.industry} &times;
            </Badge>
          )}
          {filters.stage !== 'all' && (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/10"
              onClick={() => setFilters((prev) => ({ ...prev, stage: 'all' }))}
            >
              {tStages(filters.stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction')} &times;
            </Badge>
          )}
          {filters.country !== 'all' && (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/10"
              onClick={() => setFilters((prev) => ({ ...prev, country: 'all' }))}
            >
              {getCountryFlag(filters.country)} &times;
            </Badge>
          )}
          {filters.openOnly && (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/10"
              onClick={() => setFilters((prev) => ({ ...prev, openOnly: false }))}
            >
              {t('openOnly')} &times;
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] text-muted-foreground"
            onClick={() =>
              setFilters({ industry: 'all', stage: 'all', country: 'all', openOnly: false })
            }
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Ideas grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-5 animate-pulse space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded-md" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-4 w-14 bg-muted rounded-full" />
                <div className="h-4 w-16 bg-muted rounded-full" />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="h-6 w-6 bg-muted rounded-full" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="h-8 w-8" />}
          title={tCommon('noResults')}
          description="No ideas match your current filters. Try adjusting your criteria or post a new idea."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              currentUserId={currentUserId}
              hasUpvoted={upvotedIds.has(idea.id)}
              onUpvote={handleUpvote}
              onInterested={(idea) => setInterestedIdea(idea)}
            />
          ))}
        </div>
      )}

      {/* Interested Modal */}
      <InterestedModal
        idea={interestedIdea}
        open={!!interestedIdea}
        onOpenChange={(open) => {
          if (!open) setInterestedIdea(null);
        }}
      />
    </div>
  );
}
