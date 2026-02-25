'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ScoreBreakdownProps {
  breakdown: {
    roles: number;
    industry: number;
    commitment: number;
    stage: number;
    location: number;
    languages: number;
  };
}

interface CategoryConfig {
  key: keyof ScoreBreakdownProps['breakdown'];
  labelKey: string;
  maxKey: string;
  max: number;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'roles', labelKey: 'roles', maxKey: 'rolesMax', max: 30 },
  { key: 'industry', labelKey: 'industry', maxKey: 'industryMax', max: 20 },
  { key: 'commitment', labelKey: 'commitment', maxKey: 'commitmentMax', max: 20 },
  { key: 'stage', labelKey: 'stage', maxKey: 'stageMax', max: 10 },
  { key: 'location', labelKey: 'location', maxKey: 'locationMax', max: 10 },
  { key: 'languages', labelKey: 'languages', maxKey: 'languagesMax', max: 10 },
];

function getBarColor(value: number, max: number): string {
  const percent = (value / max) * 100;
  if (percent >= 70) return 'bg-emerald-500';
  if (percent >= 40) return 'bg-amber-500';
  return 'bg-gray-400 dark:bg-gray-500';
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const t = useTranslations('matches');

  return (
    <div className="space-y-3 pt-2">
      {CATEGORIES.map(({ key, labelKey, maxKey, max }) => {
        const value = breakdown[key] ?? 0;
        const percent = Math.round((value / max) * 100);

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {t(labelKey as 'roles' | 'industry' | 'commitment' | 'stage' | 'location' | 'languages')}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {value}
                <span className="text-muted-foreground/60">
                  {t(maxKey as 'rolesMax' | 'industryMax' | 'commitmentMax' | 'stageMax' | 'locationMax' | 'languagesMax')}
                </span>
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  getBarColor(value, max)
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
