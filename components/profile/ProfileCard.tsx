'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn, getCountryFlag, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Eye, UserPlus } from 'lucide-react';
import type { Profile } from '@/types/database';

interface ProfileCardProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onConnect?: (profile: Profile) => void;
}

const roleColors: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  business: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  operations: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function isOnline(lastActive: string): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(lastActive) > sevenDaysAgo;
}

export function ProfileCard({ profile, isOwnProfile = false, onConnect }: ProfileCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('discover');
  const tRoles = useTranslations('roles');
  const tCommitments = useTranslations('commitments');

  const online = isOnline(profile.last_active);
  const topSkills = profile.skills.slice(0, 4);
  const displayIndustries = profile.industries.slice(0, 3);

  return (
    <Card className="group rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
      <CardContent className="p-5 space-y-3.5">
        {/* Header: Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-border/40 group-hover:ring-primary/20 transition-all duration-200">
              <AvatarImage
                src={profile.avatar_url ?? undefined}
                alt={profile.full_name ?? ''}
              />
              <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                {profile.full_name ? getInitials(profile.full_name) : '?'}
              </AvatarFallback>
            </Avatar>
            {online && (
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {profile.full_name}
              {isOwnProfile && (
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(You)</span>
              )}
            </h3>
            {profile.headline && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {(profile.country || profile.city) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {profile.country ? (
              <span className="text-sm">{getCountryFlag(profile.country)}</span>
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            <span className="truncate">
              {[profile.city, profile.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Roles */}
        {profile.role.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.role.map((role) => {
              const roleKey = role.toLowerCase();
              return (
                <span
                  key={role}
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
                    roleColors[roleKey] ?? 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {tRoles(roleKey as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                </span>
              );
            })}
          </div>
        )}

        {/* Skills */}
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {topSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0 h-5 rounded-full"
              >
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 4 && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal px-1.5 py-0 h-5 rounded-full"
              >
                +{profile.skills.length - 4}
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
                className="text-[10px] font-normal px-1.5 py-0 h-5 rounded-full"
              >
                {industry}
              </Badge>
            ))}
            {profile.industries.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] font-normal px-1.5 py-0 h-5 rounded-full"
              >
                +{profile.industries.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Commitment */}
        {profile.commitment && (
          <Badge
            variant="secondary"
            className="text-[10px] font-medium px-2 py-0.5 h-5 rounded-full"
          >
            {tCommitments(profile.commitment as 'full_time' | 'part_time' | 'exploring')}
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            asChild
          >
            <Link href={`/${locale}/profile/${profile.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              {t('viewProfile')}
            </Link>
          </Button>
          {!isOwnProfile && (
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onConnect?.(profile)}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              {t('connect')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
