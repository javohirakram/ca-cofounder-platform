'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn, getCountryFlag, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreBreakdown } from '@/components/matches/ScoreBreakdown';
import {
  MapPin,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
  Undo2,
} from 'lucide-react';
import type { Profile, Match } from '@/types/database';
import type { Json } from '@/types/database';

interface MatchCardProps {
  match: Match;
  profile: Profile;
  onConnect: (profile: Profile) => void;
  onPass: (matchId: string) => void;
  onUndo?: (matchId: string) => void;
  isPassed?: boolean;
}

const roleColors: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  business: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  operations: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-gray-500 dark:text-gray-400';
}

function getScoreRingColor(score: number): string {
  if (score >= 70) return 'border-emerald-500';
  if (score >= 40) return 'border-amber-500';
  return 'border-gray-300 dark:border-gray-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 70) return 'bg-emerald-50 dark:bg-emerald-950/30';
  if (score >= 40) return 'bg-amber-50 dark:bg-amber-950/30';
  return 'bg-gray-50 dark:bg-gray-900/30';
}

interface ScoreBreakdownData {
  roles: number;
  industry: number;
  commitment: number;
  stage: number;
  location: number;
  languages: number;
}

function parseBreakdown(raw: Json): ScoreBreakdownData {
  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    'roles' in raw
  ) {
    const obj = raw as Record<string, Json | undefined>;
    return {
      roles: typeof obj.roles === 'number' ? obj.roles : 0,
      industry: typeof obj.industry === 'number' ? obj.industry : 0,
      commitment: typeof obj.commitment === 'number' ? obj.commitment : 0,
      stage: typeof obj.stage === 'number' ? obj.stage : 0,
      location: typeof obj.location === 'number' ? obj.location : 0,
      languages: typeof obj.languages === 'number' ? obj.languages : 0,
    };
  }
  return { roles: 0, industry: 0, commitment: 0, stage: 0, location: 0, languages: 0 };
}

export function MatchCard({
  match,
  profile,
  onConnect,
  onPass,
  onUndo,
  isPassed = false,
}: MatchCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('matches');
  const tRoles = useTranslations('roles');

  const [expanded, setExpanded] = useState(false);

  const breakdown = parseBreakdown(match.score_breakdown);
  const topSkills = profile.skills.slice(0, 3);
  const displayIndustries = profile.industries.slice(0, 2);

  return (
    <Card
      className={cn(
        'rounded-xl shadow-sm transition-shadow duration-200 overflow-hidden',
        isPassed ? 'opacity-70' : 'hover:shadow-md'
      )}
    >
      <CardContent className="p-5">
        {/* Main row */}
        <div className="flex items-center gap-4">
          {/* Left: Avatar + info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href={`/${locale}/profile/${profile.id}`}>
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={profile.full_name ?? ''}
                />
                <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                  {profile.full_name ? getInitials(profile.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <Link
                href={`/${locale}/profile/${profile.id}`}
                className="text-sm font-semibold text-foreground truncate block hover:underline"
              >
                {profile.full_name}
              </Link>
              {profile.headline && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {profile.headline}
                </p>
              )}
              {(profile.country || profile.city) && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  {profile.country ? (
                    <span className="text-xs">
                      {getCountryFlag(profile.country)}
                    </span>
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  <span className="truncate">
                    {[profile.city, profile.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Skills + Industries (hidden on mobile) */}
          <div className="hidden md:flex flex-col gap-1.5 flex-1 min-w-0">
            {/* Roles */}
            {profile.role.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.role.map((role) => (
                  <span
                    key={role}
                    className={cn(
                      'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                      roleColors[role] ?? 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                  </span>
                ))}
              </div>
            )}
            {/* Skills */}
            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {topSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
                  >
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
                  >
                    +{profile.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {/* Industries */}
            {displayIndustries.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {displayIndustries.map((industry) => (
                  <Badge
                    key={industry}
                    variant="outline"
                    className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
                  >
                    {industry}
                  </Badge>
                ))}
                {profile.industries.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
                  >
                    +{profile.industries.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right: Score circle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'flex flex-col items-center justify-center shrink-0 h-16 w-16 rounded-full border-2 transition-colors cursor-pointer',
              getScoreRingColor(match.score),
              getScoreBgColor(match.score)
            )}
            aria-label={t('scoreBreakdown')}
          >
            <span
              className={cn(
                'text-lg font-bold tabular-nums leading-none',
                getScoreColor(match.score)
              )}
            >
              {match.score}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              /100
            </span>
          </button>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {isPassed ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => onUndo?.(match.id)}
              >
                <Undo2 className="h-3.5 w-3.5" />
                {t('undo')}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => onConnect(profile)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('connect')}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => onPass(match.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('pass')}</span>
                </Button>
              </>
            )}
          </div>

          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Mobile: show skills/industries */}
        <div className="md:hidden mt-3 space-y-1.5">
          {profile.role.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.role.map((role) => (
                <span
                  key={role}
                  className={cn(
                    'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                    roleColors[role] ?? 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                </span>
              ))}
            </div>
          )}
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Expandable score breakdown */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('scoreBreakdown')}
            </p>
            <ScoreBreakdown breakdown={breakdown} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
