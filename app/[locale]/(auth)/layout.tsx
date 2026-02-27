'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { LanguageToggle } from '@/components/ui/language-toggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-transparent to-transparent" />

      {/* Language switcher — preserves current page (login/register/etc.) */}
      <div className="absolute right-4 top-4">
        <LanguageToggle currentLocale={locale} />
      </div>

      {/* Centered content container */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Brand */}
        <div className="mb-8 flex justify-center">
          <Link href={`/${locale}`} className="inline-block">
            <Logo size="lg" showText={true} />
          </Link>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-lg shadow-black/[0.03] dark:shadow-black/20">
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
