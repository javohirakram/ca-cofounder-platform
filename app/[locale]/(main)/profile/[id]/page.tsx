import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { cn, getCountryFlag, getInitials, formatRelativeTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import {
  ArrowLeft,
  MapPin,
  Clock,
  UserPlus,
  MessageCircle,
  Linkedin,
  Send,
  Briefcase,
  GraduationCap,
  Search,
  CircleCheck,
  CircleDashed,
} from 'lucide-react';
import type { Profile, Idea, Connection, Json } from '@/types/database';

interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  current?: boolean;
}

interface EducationEntry {
  school: string;
  degree: string;
  field: string;
  graduation_year: string;
}

type IdeaWithAuthor = Idea & { author?: Profile | null };

const roleColors: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  business: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  operations: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const commitmentColors: Record<string, string> = {
  full_time: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  part_time: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  exploring: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

function parseJsonArray<T>(json: Json): T[] {
  if (Array.isArray(json)) return json as T[];
  return [];
}

export default async function ProfilePage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslations('profile');
  const tRoles = await getTranslations('roles');
  const tCommitments = await getTranslations('commitments');
  const tCommon = await getTranslations('common');

  const supabase = createServerSupabaseClient();

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const typedProfile = profile as Profile;
  const isOwner = currentUserId === typedProfile.id;

  // Fetch connection status between current user and this profile
  let connectionStatus: 'none' | 'pending' | 'connected' = 'none';
  if (currentUserId && !isOwner) {
    const { data: connections } = await supabase
      .from('connections')
      .select('*')
      .or(
        `and(requester_id.eq.${currentUserId},recipient_id.eq.${typedProfile.id}),and(requester_id.eq.${typedProfile.id},recipient_id.eq.${currentUserId})`
      )
      .limit(1);

    if (connections && connections.length > 0) {
      const conn = connections[0] as Connection;
      connectionStatus = conn.status === 'accepted' ? 'connected' : 'pending';
    }
  }

  // Fetch ideas by this user
  const { data: ideasData } = await supabase
    .from('ideas')
    .select('*, author:profiles!ideas_author_id_fkey(*)')
    .eq('author_id', typedProfile.id)
    .order('created_at', { ascending: false });

  const userIdeas: IdeaWithAuthor[] = (ideasData ?? []).map(
    (item: Record<string, unknown>) => {
      const { author, ...rest } = item;
      return { ...rest, author: author ?? null };
    }
  ) as IdeaWithAuthor[];

  // Fetch upvoted ideas for current user
  let userUpvotedIds: string[] = [];
  if (currentUserId && userIdeas.length > 0) {
    const { data: upvotes } = await supabase
      .from('idea_upvotes')
      .select('idea_id')
      .eq('user_id', currentUserId)
      .in(
        'idea_id',
        userIdeas.map((i) => i.id)
      );

    userUpvotedIds = (upvotes ?? []).map(
      (u: { idea_id: string }) => u.idea_id
    );
  }

  // Fetch existing thread for message button
  let existingThreadId: string | null = null;
  if (currentUserId && connectionStatus === 'connected') {
    const { data: threads } = await supabase
      .from('threads')
      .select('id')
      .or(
        `and(participant_a.eq.${currentUserId},participant_b.eq.${typedProfile.id}),and(participant_a.eq.${typedProfile.id},participant_b.eq.${currentUserId})`
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .limit(1) as { data: { id: string }[] | null, error: any };

    if (threads && threads.length > 0) {
      existingThreadId = threads[0].id;
    }
  }

  // Parse experience and education
  const experience = parseJsonArray<ExperienceEntry>(typedProfile.experience);
  const education = parseJsonArray<EducationEntry>(typedProfile.education);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/${params.locale}/discover`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 md:h-28 md:w-28">
              <AvatarImage
                src={typedProfile.avatar_url ?? undefined}
                alt={typedProfile.full_name ?? ''}
              />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {typedProfile.full_name
                  ? getInitials(typedProfile.full_name)
                  : '?'}
              </AvatarFallback>
            </Avatar>
            {typedProfile.is_actively_looking && (
              <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {typedProfile.full_name}
              </h1>
              {typedProfile.headline && (
                <p className="text-sm text-muted-foreground mt-1">
                  {typedProfile.headline}
                </p>
              )}
            </div>

            {/* Location + Last Active */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {(typedProfile.country || typedProfile.city) && (
                <div className="flex items-center gap-1.5">
                  {typedProfile.country ? (
                    <span className="text-base">
                      {getCountryFlag(typedProfile.country)}
                    </span>
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {[typedProfile.city, typedProfile.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {t('lastActive', {
                    time: formatRelativeTime(typedProfile.last_active),
                  })}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isOwner ? (
                <Link href={`/${params.locale}/profile/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    {t('editProfile')}
                  </Button>
                </Link>
              ) : (
                <>
                  {connectionStatus === 'none' && currentUserId && (
                    <ConnectButton
                      profileId={typedProfile.id}
                      locale={params.locale}
                    />
                  )}
                  {connectionStatus === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="gap-1.5"
                    >
                      <CircleDashed className="h-4 w-4" />
                      {t('pendingConnection')}
                    </Button>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="gap-1.5 text-emerald-600"
                      >
                        <CircleCheck className="h-4 w-4" />
                        {t('alreadyConnected')}
                      </Button>
                      <Link
                        href={
                          existingThreadId
                            ? `/${params.locale}/messages/${existingThreadId}`
                            : `/${params.locale}/messages`
                        }
                      >
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1.5"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {t('messageButton')}
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* Social links */}
              {typedProfile.telegram_handle && (
                <a
                  href={`https://t.me/${typedProfile.telegram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    {t('telegramLink')}
                  </Button>
                </a>
              )}
              {typedProfile.linkedin_url && (
                <a
                  href={typedProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <Linkedin className="h-3.5 w-3.5" />
                    {t('linkedinLink')}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completeness (owner only) */}
      {isOwner && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {t('completeness')}
            </span>
            <span
              className={cn(
                'text-sm font-semibold',
                typedProfile.profile_completeness >= 80
                  ? 'text-emerald-600'
                  : typedProfile.profile_completeness >= 50
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
              )}
            >
              {typedProfile.profile_completeness}%
            </span>
          </div>
          <Progress value={typedProfile.profile_completeness} className="h-2" />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="experience">{t('experience')}</TabsTrigger>
          <TabsTrigger value="ideas">
            {t('ideas')}
            {userIdeas.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-muted-foreground/20 rounded-full px-1.5 py-0.5">
                {userIdeas.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Bio */}
          {typedProfile.bio && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t('bio')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {typedProfile.bio}
              </p>
            </section>
          )}

          {/* Roles + Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {typedProfile.role.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Roles
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {typedProfile.role.map((role) => (
                    <span
                      key={role}
                      className={cn(
                        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
                        roleColors[role] ??
                          'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {tRoles(
                        role as
                          | 'technical'
                          | 'business'
                          | 'design'
                          | 'product'
                          | 'operations'
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {typedProfile.skills.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {t('skills')}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {typedProfile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs font-normal rounded-full"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Industries */}
          {typedProfile.industries.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t('industries')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {typedProfile.industries.map((industry) => (
                  <Badge
                    key={industry}
                    variant="outline"
                    className="text-xs font-normal rounded-full"
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {typedProfile.languages.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t('languages')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {typedProfile.languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="text-xs font-normal rounded-full"
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <Separator />

          {/* Commitment */}
          {typedProfile.commitment && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t('commitment')}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
                  commitmentColors[typedProfile.commitment] ??
                    'bg-secondary text-secondary-foreground'
                )}
              >
                {tCommitments(
                  typedProfile.commitment as
                    | 'full_time'
                    | 'part_time'
                    | 'exploring'
                )}
              </span>
            </section>
          )}

          {/* Ecosystem Tags */}
          {typedProfile.ecosystem_tags.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t('ecosystemTags')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {typedProfile.ecosystem_tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal rounded-full border-primary/30 text-primary"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Looking For */}
          {(typedProfile.looking_for_roles.length > 0 ||
            typedProfile.looking_for_description) && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                <Search className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
                {t('lookingFor')}
              </h3>
              {typedProfile.looking_for_roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {typedProfile.looking_for_roles.map((role) => (
                    <span
                      key={role}
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                        roleColors[role] ??
                          'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {tRoles(
                        role as
                          | 'technical'
                          | 'business'
                          | 'design'
                          | 'product'
                          | 'operations'
                      )}
                    </span>
                  ))}
                </div>
              )}
              {typedProfile.looking_for_description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {typedProfile.looking_for_description}
                </p>
              )}
            </section>
          )}

          {/* Equity Range */}
          {(typedProfile.equity_min !== null ||
            typedProfile.equity_max !== null) && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t('equityRange')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {typedProfile.equity_min ?? 0}% &ndash;{' '}
                {typedProfile.equity_max ?? 100}%
              </p>
            </section>
          )}
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-8">
          {/* Work Experience */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Experience
            </h3>
            {experience.length > 0 ? (
              <div className="relative ml-3 border-l border-border pl-6 space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border bg-card">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          exp.current
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/40'
                        )}
                      />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {exp.role}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {exp.duration}
                        {exp.current && (
                          <span className="ml-2 text-emerald-600 font-medium">
                            Current
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No work experience added yet.
              </p>
            )}
          </section>

          <Separator />

          {/* Education */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </h3>
            {education.length > 0 ? (
              <div className="relative ml-3 border-l border-border pl-6 space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border bg-card">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {edu.school}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </p>
                      {edu.graduation_year && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {edu.graduation_year}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No education added yet.
              </p>
            )}
          </section>
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          {userIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUserId={currentUserId}
                  hasUpvoted={userUpvotedIds.includes(idea.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-4">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                No ideas posted yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Client component for Connect button with action
function ConnectButton({
  locale,
}: {
  profileId: string;
  locale: string;
}) {
  return (
    <Link href={`/${locale}/discover`}>
      <Button variant="default" size="sm" className="gap-1.5">
        <UserPlus className="h-4 w-4" />
        Connect
      </Button>
    </Link>
  );
}
