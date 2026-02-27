'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LanguageToggleProps {
  currentLocale: string;
  className?: string;
}

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
];

export function LanguageToggle({ currentLocale, className }: LanguageToggleProps) {
  const pathname = usePathname();

  // Strip the current locale prefix to get the raw path segment
  // e.g. "/en/login" → "/login",  "/ru" → "/"
  const pathWithoutLocale = pathname.replace(/^\/(en|ru|uz)/, '') || '/';

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      {LOCALES.map(({ code, label }) => (
        <Link
          key={code}
          href={`/${code}${pathWithoutLocale}`}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            currentLocale === code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
