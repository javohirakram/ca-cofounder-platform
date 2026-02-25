'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
] as const;

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;
  const t = useTranslations('settings');

  function switchLocale(newLocale: string) {
    const pathWithoutLocale = pathname.replace(/^\/(en|ru|uz)/, '');
    router.push(`/${newLocale}${pathWithoutLocale}`);
  }

  return (
    <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          aria-label={`${t('language')}: ${label}`}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200',
            currentLocale === code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
