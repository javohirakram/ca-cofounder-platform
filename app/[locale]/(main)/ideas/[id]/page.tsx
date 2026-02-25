import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { getCountryFlag, getInitials, formatRelativeTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import {
  ArrowLeft,
  UserPlus,
  HandHelping,
  MapPin,
  Calendar,
  Eye,
  ArrowUp,
} from 'lucide-react';
import type { Idea, Profile } from '@/types/database';

type IdeaWithAuthor = Idea & { author?: Profile | null };

const stageColors: Record<string, string> = {
  no_idea: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  have_idea: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  concept: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  prototype: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  side_project: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  early_traction: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const roleColors: Record<string, string> = {
  technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  business: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  operations: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default async function IdeaDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslations('ideas');
  const tRoles = await getTranslations('roles');
  const tStages = await getTranslations('stages');
  const tCommon = await getTranslations('common');
  const tProfile = await getTranslations('profile');
  const supabase = createServerSupabaseClient();

  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Fetch idea with author
  const { data: ideaData, error: ideaError } = await supabase
    .from('ideas')
    .select('*, author:profiles!ideas_author_id_fkey(*)')
    .eq('id', params.id)
    .single();

  if (ideaError || !ideaData) {
    notFound();
  }

  const rawIdea = ideaData as Record<string, unknown>;
  const { author: rawAuthor, ...restIdea } = rawIdea;
  const idea = restIdea as unknown as Idea;
  const author = (rawAuthor ?? null) as Profile | null;

  // Increment view count
  await supabase
    .from('ideas')
    .update({ views: idea.views + 1 } as never)
    .eq('id', idea.id);

  // Fetch related ideas (same industry, excluding current)
  let relatedIdeas: IdeaWithAuthor[] = [];
  if (idea.industries.length > 0) {
    const { data: relatedData } = await supabase
      .from('ideas')
      .select('*, author:profiles!ideas_author_id_fkey(*)')
      .neq('id', idea.id)
      .overlaps('industries', idea.industries)
      .order('upvotes', { ascending: false })
      .limit(3);

    relatedIdeas = (relatedData ?? []).map((item: Record<string, unknown>) => {
      const { author, ...rest } = item;
      return { ...rest, author: author ?? null };
    }) as IdeaWithAuthor[];
  }

  // Check user upvotes for related ideas
  let relatedUpvotedIds: string[] = [];
  if (currentUserId && relatedIdeas.length > 0) {
    const { data: upvotes } = await supabase
      .from('idea_upvotes')
      .select('idea_id')
      .eq('user_id', currentUserId)
      .in('idea_id', relatedIdeas.map((i) => i.id));

    relatedUpvotedIds = (upvotes ?? []).map((u: { idea_id: string }) => u.idea_id);
  }

  const stageLabelKey = idea.stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/${params.locale}/ideas`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Idea details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Meta */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{idea.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {idea.stage && (
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                    stageColors[idea.stage] ?? 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {tStages(stageLabelKey)}
                </span>
              )}
              {idea.is_open ? (
                <Badge variant="default" className="text-xs">Open</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Closed</Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(idea.created_at)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {idea.views + 1}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3" />
                {idea.upvotes}
              </div>
            </div>
          </div>

          {/* Industries */}
          {idea.industries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {idea.industries.map((industry) => (
                <Badge key={industry} variant="outline" className="text-xs">
                  {industry}
                </Badge>
              ))}
            </div>
          )}

          {/* Country focus */}
          {idea.country_focus.length > 0 && (
            <div className="flex items-center gap-2">
              {idea.country_focus.map((code) => (
                <span key={code} className="text-lg" title={code}>
                  {getCountryFlag(code)}
                </span>
              ))}
            </div>
          )}

          <Separator />

          {/* Description */}
          {idea.description && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{t('ideaDescription')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
          )}

          {/* Problem */}
          {idea.problem && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{t('problem')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {idea.problem}
              </p>
            </div>
          )}

          {/* Solution */}
          {idea.solution && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{t('solution')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {idea.solution}
              </p>
            </div>
          )}

          <Separator />

          {/* Looking For */}
          {idea.looking_for_roles.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">{t('lookingFor')}</h2>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {idea.looking_for_roles.map((role) => (
                  <span
                    key={role}
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      roleColors[role] ?? 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                  </span>
                ))}
              </div>
              {idea.looking_for_description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {idea.looking_for_description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar: Author card + CTA */}
        <div className="space-y-4">
          {/* Author Card */}
          {author && (
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('postedBy')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  href={`/${params.locale}/profile/${author.id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={author.avatar_url ?? undefined} alt={author.full_name ?? ''} />
                    <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                      {author.full_name ? getInitials(author.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:underline truncate">
                      {author.full_name}
                    </p>
                    {author.headline && (
                      <p className="text-xs text-muted-foreground truncate">
                        {author.headline}
                      </p>
                    )}
                  </div>
                </Link>

                {(author.country || author.city) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {author.country ? (
                      <span>{getCountryFlag(author.country)}</span>
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {[author.city, author.country].filter(Boolean).join(', ')}
                  </div>
                )}

                {currentUserId && currentUserId !== author.id && (
                  <div className="flex gap-2">
                    <Link href={`/${params.locale}/profile/${author.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <UserPlus className="h-3.5 w-3.5" />
                        {tProfile('connectButton')}
                      </Button>
                    </Link>
                    <Link href={`/${params.locale}/messages`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        {tProfile('messageButton')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interested CTA */}
          {currentUserId && currentUserId !== idea.author_id && idea.is_open && (
            <Card className="rounded-xl border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center space-y-3">
                <HandHelping className="h-8 w-8 text-primary mx-auto" />
                <p className="text-sm font-medium text-foreground">
                  {t('interestedTitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('interestedMessage')}
                </p>
                <IdeaInterestedButton ideaId={idea.id} locale={params.locale} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Related Ideas */}
      {relatedIdeas.length > 0 && (
        <div className="space-y-4 pt-4">
          <Separator />
          <h2 className="text-lg font-semibold text-foreground">{t('relatedIdeas')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedIdeas.map((related) => (
              <IdeaCard
                key={related.id}
                idea={related}
                currentUserId={currentUserId}
                hasUpvoted={relatedUpvotedIds.includes(related.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Small client component for the "I'm Interested" button on the detail page
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IdeaInterestedButton({ ideaId, locale }: { ideaId: string; locale: string }) {
  return (
    <Link href={`/${locale}/ideas`}>
      <Button size="sm" className="w-full gap-1.5">
        <HandHelping className="h-4 w-4" />
        I&apos;m Interested
      </Button>
    </Link>
  );
}
