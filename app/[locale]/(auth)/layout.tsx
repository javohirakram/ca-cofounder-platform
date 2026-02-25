'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const params = useParams();
  const locale = params.locale as string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations('nav');

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-transparent to-transparent" />

      {/* Language switcher in top-right corner */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <Link
          href={`/en${''}`}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            locale === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          EN
        </Link>
        <Link
          href={`/ru${''}`}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            locale === 'ru'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          RU
        </Link>
        <Link
          href={`/uz${''}`}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            locale === 'uz'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          UZ
        </Link>
      </div>

      {/* Centered content container */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              CoFound
              <span className="text-primary/70"> Central Asia</span>
            </h1>
          </Link>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>

        {/* Footer links */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CoFound Central Asia. All rights reserved.
        </p>
      </div>
    </div>
  );
}
