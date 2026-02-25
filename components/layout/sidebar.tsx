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
  Bell,
  Settings,
  User,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: SidebarItem[] = [
  { labelKey: 'discover', href: '/discover', icon: Compass },
  { labelKey: 'matches', href: '/matches', icon: Users },
  { labelKey: 'ideas', href: '/ideas', icon: Lightbulb },
  { labelKey: 'messages', href: '/messages', icon: MessageSquare },
];

const bottomNavItems: SidebarItem[] = [
  { labelKey: 'notifications', href: '/notifications', icon: Bell },
  { labelKey: 'settings', href: '/settings', icon: Settings },
  { labelKey: 'profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('nav');

  function isActive(href: string): boolean {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="hidden md:flex md:w-[68px] lg:w-[240px] flex-col border-r border-border bg-card h-screen sticky top-0">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href={`/${locale}/discover`}>
            <Logo size="md" showText={false} className="lg:hidden" />
            <Logo size="md" showText={true} className="hidden lg:flex" />
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/${locale}${item.href}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:block">{t(item.labelKey)}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  {t(item.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="space-y-1 border-t border-border px-2 py-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/${locale}${item.href}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:block">{t(item.labelKey)}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  {t(item.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}
