'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getCountryFlag, truncate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import type { Accelerator } from '@/types/database';

interface AcceleratorCardProps {
  accelerator: Accelerator;
  memberCount: number;
  locale: string;
}

export function AcceleratorCard({
  accelerator,
  memberCount,
  locale,
}: AcceleratorCardProps) {
  const t = useTranslations('accelerators');

  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-3.5">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          {accelerator.logo_url ? (
            <Image
              src={accelerator.logo_url}
              alt={accelerator.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl object-cover border shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">
                {accelerator.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {accelerator.name}
            </h3>
            {(accelerator.country || accelerator.city) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                {accelerator.country ? (
                  <span className="text-sm">
                    {getCountryFlag(accelerator.country)}
                  </span>
                ) : (
                  <MapPin className="h-3 w-3" />
                )}
                <span className="truncate">
                  {[accelerator.city, accelerator.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {accelerator.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncate(accelerator.description, 120)}
          </p>
        )}

        {/* Website */}
        {accelerator.website && (
          <a
            href={accelerator.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3" />
            {t('website')}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}

        {/* Footer: member count + View Details */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {memberCount} {t('members')}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2" asChild>
            <Link href={`/${locale}/accelerators/${accelerator.id}`}>
              View Details
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
