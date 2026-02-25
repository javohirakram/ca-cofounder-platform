'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  FileBarChart,
  ArrowLeft,
} from 'lucide-react';
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

const adminNavItems: SidebarItem[] = [
  { labelKey: 'title', href: '/admin', icon: LayoutDashboard },
  { labelKey: 'users', href: '/admin/users', icon: Users },
  { labelKey: 'ideas', href: '/admin/ideas', icon: Lightbulb },
  { labelKey: 'reports', href: '/admin/reports', icon: FileBarChart },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin');
  const navT = useTranslations('nav');

  function isActive(href: string): boolean {
    const fullPath = `/${locale}${href}`;
    if (href === '/admin') {
      return pathname === fullPath;
    }
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="hidden md:flex md:w-[68px] lg:w-[240px] flex-col border-r border-border bg-card h-screen sticky top-0">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground text-sm font-bold">
              AD
            </div>
            <span className="hidden lg:block text-sm font-semibold tracking-tight">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Admin nav */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {adminNavItems.map((item) => {
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

        {/* Back to app */}
        <div className="border-t border-border px-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/${locale}/discover`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="h-5 w-5 shrink-0" />
                <span className="hidden lg:block">{navT('discover')}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Back to App
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
