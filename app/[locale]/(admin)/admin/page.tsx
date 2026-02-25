import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Lightbulb,
  Link2,
  MessageSquare,
  ArrowRight,
  FileBarChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = createServerSupabaseClient();
  const t = await getTranslations('admin');

  // Fetch all counts in parallel
  const [
    usersResult,
    activeUsersResult,
    ideasResult,
    connectionsResult,
    messagesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt(
        'last_active',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
    supabase.from('ideas').select('*', { count: 'exact', head: true }),
    supabase.from('connections').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
  ]);

  const totalUsers = usersResult.count ?? 0;
  const activeUsers = activeUsersResult.count ?? 0;
  const totalIdeas = ideasResult.count ?? 0;
  const totalConnections = connectionsResult.count ?? 0;
  const totalMessages = messagesResult.count ?? 0;

  const quickLinks = [
    {
      label: t('users'),
      href: `/${locale}/admin/users`,
      icon: <Users className="h-4 w-4" />,
      description: 'Manage user accounts and roles',
    },
    {
      label: t('ideas'),
      href: `/${locale}/admin/ideas`,
      icon: <Lightbulb className="h-4 w-4" />,
      description: 'Review and manage startup ideas',
    },
    {
      label: t('reports'),
      href: `/${locale}/admin/reports`,
      icon: <FileBarChart className="h-4 w-4" />,
      description: 'View platform analytics',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t('totalUsers')}
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title={t('activeUsers')}
          value={activeUsers}
          icon={<UserCheck className="h-5 w-5" />}
          description="Active in the last 7 days"
        />
        <StatCard
          title={t('totalIdeas')}
          value={totalIdeas}
          icon={<Lightbulb className="h-5 w-5" />}
        />
        <StatCard
          title={t('connections')}
          value={totalConnections}
          icon={<Link2 className="h-5 w-5" />}
        />
        <StatCard
          title={t('messagesSent')}
          value={totalMessages}
          icon={<MessageSquare className="h-5 w-5" />}
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {link.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
