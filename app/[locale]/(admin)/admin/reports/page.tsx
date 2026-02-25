import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileBarChart,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
} from 'lucide-react';

export default async function AdminReportsPage() {
  const t = await getTranslations('admin');

  const plannedFeatures = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Growth Analytics',
      description:
        'Track user sign-ups, retention rates, and platform growth over time with interactive charts.',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'User Engagement',
      description:
        'Monitor active user metrics, session durations, and feature usage across the platform.',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Connection Insights',
      description:
        'Analyze connection request patterns, acceptance rates, and networking activity.',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: 'Periodic Reports',
      description:
        'Generate weekly and monthly summary reports with key performance indicators.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('reports')}</h1>
        <p className="text-sm text-muted-foreground">
          Platform analytics and reporting
        </p>
      </div>

      {/* Coming soon state */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileBarChart className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Coming Soon</h2>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          The reporting dashboard is currently under development. Soon you will
          be able to view detailed analytics and generate reports about platform
          activity.
        </p>
      </div>

      {/* Planned features */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Planned Features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plannedFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
