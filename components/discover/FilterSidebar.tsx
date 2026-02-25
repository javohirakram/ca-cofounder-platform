'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X } from 'lucide-react';

export interface DiscoverFilters {
  countries: string[];
  roles: string[];
  industries: string[];
  commitment: string;
  idea_stages: string[];
  languages: string[];
  ecosystem_tags: string[];
  actively_looking: boolean;
}

interface FilterSidebarProps {
  filters: DiscoverFilters;
  onFilterChange: (filters: DiscoverFilters) => void;
}

const COUNTRIES = [
  { value: 'KZ', labelKey: 'Kazakhstan' },
  { value: 'KG', labelKey: 'Kyrgyzstan' },
  { value: 'UZ', labelKey: 'Uzbekistan' },
  { value: 'TJ', labelKey: 'Tajikistan' },
  { value: 'TM', labelKey: 'Turkmenistan' },
];

const ROLES = ['technical', 'business', 'design', 'product', 'operations'];

const INDUSTRIES = [
  'Fintech', 'Edtech', 'Healthtech', 'Agritech', 'E-commerce',
  'Logistics', 'AI/ML', 'SaaS', 'Marketplace', 'Social',
];

const IDEA_STAGES = ['no_idea', 'have_idea', 'concept', 'prototype', 'side_project', 'early_traction'];

const LANGUAGES = ['English', 'Russian', 'Uzbek', 'Kazakh', 'Kyrgyz', 'Tajik', 'Turkmen'];

const ECOSYSTEM_TAGS = [
  'Astana Hub', 'MOST', 'Techstars', 'NURIS', 'IT Park Uzbekistan',
  'Google for Startups', 'YC Alumni', 'Plug and Play',
];

function getActiveFilterCount(filters: DiscoverFilters): number {
  let count = 0;
  count += filters.countries.length;
  count += filters.roles.length;
  count += filters.industries.length;
  if (filters.commitment && filters.commitment !== 'any') count++;
  count += filters.idea_stages.length;
  count += filters.languages.length;
  count += filters.ecosystem_tags.length;
  if (filters.actively_looking) count++;
  return count;
}

const emptyFilters: DiscoverFilters = {
  countries: [],
  roles: [],
  industries: [],
  commitment: 'any',
  idea_stages: [],
  languages: [],
  ecosystem_tags: [],
  actively_looking: false,
};

function FilterContent({ filters, onFilterChange }: FilterSidebarProps) {
  const t = useTranslations('discover');
  const tRoles = useTranslations('roles');
  const tStages = useTranslations('stages');
  const tCommitments = useTranslations('commitments');
  const tCountries = useTranslations('countries');

  const activeCount = getActiveFilterCount(filters);

  function toggleArray(key: keyof DiscoverFilters, value: string) {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  }

  function clearAll() {
    onFilterChange(emptyFilters);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{t('filterBy')}</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Country */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('country')}
        </Label>
        <div className="space-y-2">
          {COUNTRIES.map((country) => (
            <label
              key={country.value}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Checkbox
                checked={filters.countries.includes(country.value)}
                onCheckedChange={() => toggleArray('countries', country.value)}
              />
              <span className="text-sm text-foreground">
                {tCountries(country.labelKey as 'Kazakhstan' | 'Kyrgyzstan' | 'Uzbekistan' | 'Tajikistan' | 'Turkmenistan')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Role */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('role')}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => {
            const isSelected = filters.roles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleArray('roles', role)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Industry */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('industry')}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((industry) => {
            const isSelected = filters.industries.includes(industry);
            return (
              <button
                key={industry}
                type="button"
                onClick={() => toggleArray('industries', industry)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {industry}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Commitment */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('commitment')}
        </Label>
        <RadioGroup
          value={filters.commitment}
          onValueChange={(value) => onFilterChange({ ...filters, commitment: value })}
        >
          <label className="flex items-center gap-2.5 cursor-pointer">
            <RadioGroupItem value="any" />
            <span className="text-sm text-foreground">{t('anyCommitment')}</span>
          </label>
          {(['full_time', 'part_time', 'exploring'] as const).map((c) => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer">
              <RadioGroupItem value={c} />
              <span className="text-sm text-foreground">{tCommitments(c)}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Idea Stage */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('ideaStage')}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {IDEA_STAGES.map((stage) => {
            const isSelected = filters.idea_stages.includes(stage);
            return (
              <button
                key={stage}
                type="button"
                onClick={() => toggleArray('idea_stages', stage)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {tStages(stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction')}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('languages')}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((lang) => {
            const isSelected = filters.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleArray('languages', lang)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Ecosystem Tags */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('ecosystemTags')}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {ECOSYSTEM_TAGS.map((tag) => {
            const isSelected = filters.ecosystem_tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleArray('ecosystem_tags', tag)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Actively Looking */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground cursor-pointer">
          {t('activelyLooking')}
        </Label>
        <Switch
          checked={filters.actively_looking}
          onCheckedChange={(checked) =>
            onFilterChange({ ...filters, actively_looking: checked })
          }
        />
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const t = useTranslations('common');
  const tDiscover = useTranslations('discover');
  const [open, setOpen] = useState(false);
  const activeCount = getActiveFilterCount(filters);

  return (
    <>
      {/* Desktop: inline sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 pb-8">
            <FilterContent filters={filters} onFilterChange={onFilterChange} />
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile: sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t('filter')}
              {activeCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium ml-1">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 pb-0">
              <SheetTitle>{tDiscover('filterBy')}</SheetTitle>
              <SheetDescription className="sr-only">
                Filter founders by various criteria
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="p-6 pt-4">
                <FilterContent filters={filters} onFilterChange={onFilterChange} />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
