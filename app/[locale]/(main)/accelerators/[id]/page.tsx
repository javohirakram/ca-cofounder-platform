import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { getCountryFlag, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Users,
  ExternalLink,
} from 'lucide-react';
import type { Accelerator, AcceleratorMember, Profile } from '@/types/database';

interface MemberWithProfile extends AcceleratorMember {
  profile: Profile;
}

export default async function AcceleratorDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslations('accelerators');
  const tCommon = await getTranslations('common');
  const supabase = createServerSupabaseClient();

  // Fetch accelerator
  const { data: accelerator, error: accError } = await supabase
    .from('accelerators')
    .select('*')
    .eq('id', params.id)
    .single();

  if (accError || !accelerator) {
    notFound();
  }

  const typedAccelerator = accelerator as Accelerator;

  // Fetch members with profiles
  const { data: membersData } = await supabase
    .from('accelerator_members')
    .select('*, profile:profiles!accelerator_members_user_id_fkey(*)')
    .eq('accelerator_id', typedAccelerator.id)
    .order('created_at', { ascending: false });

  const members: MemberWithProfile[] = (membersData ?? [])
    .map((item: Record<string, unknown>) => {
      const { profile, ...rest } = item;
      if (!profile) return null;
      return { ...rest, profile } as MemberWithProfile;
    })
    .filter((m): m is MemberWithProfile => m !== null);

  // Group members by role
  const founders = members.filter(
    (m) => m.role === 'founder' || m.role === null
  );
  const alumni = members.filter((m) => m.role === 'alumni');
  const mentors = members.filter((m) => m.role === 'mentor');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/${params.locale}/accelerators`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      {/* Accelerator Header */}
      <div className="rounded-xl border bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Logo */}
          <div className="shrink-0">
            {typedAccelerator.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={typedAccelerator.logo_url}
                alt={typedAccelerator.name}
                className="h-20 w-20 rounded-xl object-cover border"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {typedAccelerator.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {typedAccelerator.name}
              </h1>
              {(typedAccelerator.country || typedAccelerator.city) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  {typedAccelerator.country ? (
                    <span className="text-base">
                      {getCountryFlag(typedAccelerator.country)}
                    </span>
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {[typedAccelerator.city, typedAccelerator.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>

            {typedAccelerator.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {typedAccelerator.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {typedAccelerator.website && (
                <a
                  href={typedAccelerator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {t('website')}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {members.length} {t('members')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-8">
        {/* Founders */}
        {founders.length > 0 && (
          <MemberGroup
            title={t('founders')}
            members={founders}
            locale={params.locale}
          />
        )}

        {/* Alumni */}
        {alumni.length > 0 && (
          <>
            <Separator />
            <MemberGroup
              title={t('alumni')}
              members={alumni}
              locale={params.locale}
            />
          </>
        )}

        {/* Mentors */}
        {mentors.length > 0 && (
          <>
            <Separator />
            <MemberGroup
              title={t('mentors')}
              members={mentors}
              locale={params.locale}
            />
          </>
        )}

        {members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-4">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              No members yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberGroup({
  title,
  members,
  locale,
}: {
  title: string;
  members: MemberWithProfile[];
  locale: string;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        {title}
        <Badge variant="secondary" className="text-[10px] font-normal">
          {members.length}
        </Badge>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {members.map((member) => (
          <MiniProfileCard
            key={member.id}
            profile={member.profile}
            cohort={member.cohort}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

function MiniProfileCard({
  profile,
  cohort,
  locale,
}: {
  profile: Profile;
  cohort: string | null;
  locale: string;
}) {
  return (
    <Link href={`/${locale}/profile/${profile.id}`}>
      <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage
              src={profile.avatar_url ?? undefined}
              alt={profile.full_name ?? ''}
            />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {profile.full_name ? getInitials(profile.full_name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.full_name}
            </p>
            {profile.headline && (
              <p className="text-xs text-muted-foreground truncate">
                {profile.headline}
              </p>
            )}
            {cohort && (
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                Cohort {cohort}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
