'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn, getCountryFlag, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, UserPlus, Clock, CheckCircle2 } from 'lucide-react';
import type { Profile } from '@/types/database';

interface ProfileCardProps {
  profile: Profile;
  isOwnProfile?: boolean;
  connectionStatus?: 'none' | 'pending' | 'connected';
  onConnect?: (profile: Profile) => void;
}

const ROLE_STYLES: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  business: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
  operations: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
};

const COMMITMENT_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  exploring: 'Exploring',
};

export function ProfileCard({
  profile,
  isOwnProfile = false,
  connectionStatus = 'none',
  onConnect,
}: ProfileCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('discover');

  const primaryRole = profile.role[0];
  const secondaryRole = profile.role[1];
  const topSkills = profile.skills.slice(0, 3);
  const topIndustries = profile.industries.slice(0, 2);

  return (
    <Card className="group flex flex-col rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 overflow-hidden">
      <CardContent className="flex flex-col gap-3.5 p-5 h-full">

        {/* ── Header: avatar + name + role + location ── */}
        <div className="flex items-start gap-3">
          <Link href={`/${locale}/profile/${profile.id}`} className="shrink-0">
            <Avatar className="h-11 w-11 ring-2 ring-border/40 group-hover:ring-primary/25 transition-all duration-200">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ''} />
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {profile.full_name ? getInitials(profile.full_name) : '?'}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0 space-y-0.5">
            <Link
              href={`/${locale}/profile/${profile.id}`}
              className="block text-sm font-semibold text-foreground truncate hover:text-primary transition-colors"
            >
              {profile.full_name}
              {isOwnProfile && (
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(You)</span>
              )}
            </Link>

            {profile.headline && (
              <p className="text-xs text-muted-foreground truncate">{profile.headline}</p>
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
        </div>

        {/* ── Role pills: primary + optional secondary ── */}
        {primaryRole && (
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize',
                ROLE_STYLES[primaryRole.toLowerCase()] ?? 'bg-secondary text-secondary-foreground'
              )}
            >
              {primaryRole}
            </span>
            {secondaryRole && (
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize',
                  ROLE_STYLES[secondaryRole.toLowerCase()] ?? 'bg-secondary text-secondary-foreground'
                )}
              >
                {secondaryRole}
              </span>
            )}
            {profile.commitment && (
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60">
                {COMMITMENT_LABELS[profile.commitment] ?? profile.commitment}
              </span>
            )}
          </div>
        )}

        {/* ── Skills ── */}
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="rounded-full text-[11px] font-normal px-2 py-0 h-5">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="secondary" className="rounded-full text-[11px] font-normal px-2 py-0 h-5 text-muted-foreground">
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* ── Industries ── */}
        {topIndustries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topIndustries.map((industry) => (
              <Badge key={industry} variant="outline" className="rounded-full text-[11px] font-normal px-2 py-0 h-5 border-border/60">
                {industry}
              </Badge>
            ))}
            {profile.industries.length > 2 && (
              <Badge variant="outline" className="rounded-full text-[11px] font-normal px-2 py-0 h-5 border-border/60 text-muted-foreground">
                +{profile.industries.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-auto pt-3.5 border-t border-border/40 flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs font-normal text-muted-foreground hover:text-foreground" asChild>
            <Link href={`/${locale}/profile/${profile.id}`}>
              {t('viewProfile')}
            </Link>
          </Button>

          {!isOwnProfile && connectionStatus === 'none' && (
            <Button size="sm" className="flex-1 h-8 text-xs font-medium" onClick={() => onConnect?.(profile)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {t('connect')}
            </Button>
          )}
          {!isOwnProfile && connectionStatus === 'pending' && (
            <Button
              size="sm" variant="outline" disabled
              className="flex-1 h-8 text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-400 cursor-default"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {t('pending')}
            </Button>
          )}
          {!isOwnProfile && connectionStatus === 'connected' && (
            <Button
              size="sm" variant="outline" disabled
              className="flex-1 h-8 text-xs text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-400 cursor-default"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {t('connected')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
