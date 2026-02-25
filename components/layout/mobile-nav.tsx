'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Compass,
  Users,
  Lightbulb,
  MessageSquare,
  User,
} from 'lucide-react';

interface MobileNavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const mobileNavItems: MobileNavItem[] = [
  { labelKey: 'discover', href: '/discover', icon: Compass },
  { labelKey: 'matches', href: '/matches', icon: Users },
  { labelKey: 'ideas', href: '/ideas', icon: Lightbulb },
  { labelKey: 'messages', href: '/messages', icon: MessageSquare },
  { labelKey: 'profile', href: '/profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('nav');

  function isActive(href: string): boolean {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm px-2 py-1 md:hidden safe-area-bottom">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors',
              active
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', active && 'text-primary')} />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
