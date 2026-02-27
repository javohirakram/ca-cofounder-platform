'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn, getInitials, getCountryFlag } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, CheckCircle2, UserPlus, X, Dot } from 'lucide-react';
import type { Profile } from '@/types/database';

interface DiscoverMatchCardProps {
  profile: Profile;
  score: number;
  reasons: string[];
  matchId?: string;
  connectionStatus?: 'none' | 'pending' | 'connected';
  onConnect: (profile: Profile) => void;
  onPass?: (matchId: string) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const isStrong = score >= 72;
  const isGood = score >= 48;
  return (
    <div
      className={cn(
        'shrink-0 flex items-baseline gap-0.5 rounded-full px-2.5 py-1 tabular-nums',
        isStrong
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
          : isGood
          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <span className="text-sm font-bold leading-none">{score}</span>
      <span className="text-[10px] font-medium opacity-70">%</span>
    </div>
  );
}

export function DiscoverMatchCard({
  profile,
  score,
  reasons,
  matchId,
  connectionStatus = 'none',
  onConnect,
  onPass,
}: DiscoverMatchCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('discover');

  const primaryRole = profile.role[0];
  const topSkills = profile.skills.slice(0, 3);
  const lookingForRoles = (profile.looking_for_roles ?? []).slice(0, 2);

  return (
    <Card className="group flex flex-col rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-5 h-full">

        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link href={`/${locale}/profile/${profile.id}`} className="shrink-0">
            <Avatar className="h-11 w-11 ring-2 ring-border/40 group-hover:ring-primary/25 transition-all duration-200">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ''} />
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {profile.full_name ? getInitials(profile.full_name) : '?'}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Name + role + location */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <Link
              href={`/${locale}/profile/${profile.id}`}
              className="block text-sm font-semibold text-foreground truncate hover:text-primary transition-colors"
            >
              {profile.full_name}
            </Link>

            {primaryRole && (
              <RolePill role={primaryRole} />
            )}

            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {profile.country ? (
                  <span>{getCountryFlag(profile.country)}</span>
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span className="truncate">
                  {[profile.city, profile.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Score */}
          <ScoreBadge score={score} />
        </div>

        {/* ── Why this match ── */}
        {reasons.length > 0 && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
              {t('whyThisMatch')}
            </p>
            <ul className="space-y-1">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-snug">
                  <Dot className="h-3.5 w-3.5 shrink-0 -ml-0.5 mt-0.5 text-primary/50" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Strengths (skills) ── */}
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="rounded-full text-[11px] font-normal px-2 py-0 h-5"
              >
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge
                variant="secondary"
                className="rounded-full text-[11px] font-normal px-2 py-0 h-5 text-muted-foreground"
              >
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* ── Looking for ── */}
        {lookingForRoles.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">
              {t('lookingFor')}
            </span>
            {lookingForRoles.map((role) => (
              <Badge
                key={role}
                variant="outline"
                className="rounded-full text-[11px] font-normal px-2 py-0 h-5 capitalize border-border/60"
              >
                {role}
              </Badge>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs font-normal text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={`/${locale}/profile/${profile.id}`}>
              {t('viewProfile')}
            </Link>
          </Button>

          {connectionStatus === 'none' && (
            <Button
              size="sm"
              className="flex-1 h-8 text-xs font-medium"
              onClick={() => onConnect(profile)}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {t('connect')}
            </Button>
          )}

          {connectionStatus === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-400 cursor-default"
              disabled
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {t('pending')}
            </Button>
          )}

          {connectionStatus === 'connected' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-400 cursor-default"
              disabled
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {t('connected')}
            </Button>
          )}

          {matchId && onPass && connectionStatus === 'none' && (
            <button
              onClick={() => onPass(matchId)}
              className="shrink-0 h-8 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
              aria-label="Pass"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  business: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
  operations: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
};

function RolePill({ role }: { role: string }) {
  const key = role.toLowerCase();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize',
        ROLE_STYLES[key] ?? 'bg-secondary text-secondary-foreground'
      )}
    >
      {role}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function DiscoverMatchCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-3.5 w-16 bg-muted rounded-md" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="h-7 w-12 rounded-full bg-muted" />
      </div>
      <div className="rounded-lg bg-muted h-16" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="h-5 w-18 rounded-full bg-muted" />
        <div className="h-5 w-12 rounded-full bg-muted" />
      </div>
      <div className="pt-4 border-t border-border/30 flex gap-2">
        <div className="flex-1 h-8 rounded-md bg-muted" />
        <div className="flex-1 h-8 rounded-md bg-muted" />
        <div className="h-8 w-8 rounded-md bg-muted" />
      </div>
    </div>
  );
}
