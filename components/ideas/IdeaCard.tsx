'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn, getCountryFlag, getInitials, truncate, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, Eye, HandHelping, ArrowRight } from 'lucide-react';
import type { Idea, Profile } from '@/types/database';

const stageColors: Record<string, string> = {
  no_idea: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  have_idea: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  concept: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  prototype: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  side_project: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  early_traction: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

interface IdeaCardProps {
  idea: Idea & { author?: Profile | null };
  currentUserId?: string;
  hasUpvoted?: boolean;
  onUpvote?: (ideaId: string) => void;
  onInterested?: (idea: Idea) => void;
}

export function IdeaCard({
  idea,
  currentUserId,
  hasUpvoted = false,
  onUpvote,
  onInterested,
}: IdeaCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('ideas');
  const tStages = useTranslations('stages');
  const [upvoted, setUpvoted] = useState(hasUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(idea.upvotes);
  const [upvoting, setUpvoting] = useState(false);

  async function handleUpvote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || upvoting) return;

    setUpvoting(true);
    const supabase = createClient();

    try {
      if (upvoted) {
        await supabase
          .from('idea_upvotes')
          .delete()
          .eq('idea_id', idea.id)
          .eq('user_id', currentUserId);

        await supabase
          .from('ideas')
          .update({ upvotes: Math.max(0, upvoteCount - 1) } as never)
          .eq('id', idea.id);

        setUpvoteCount((prev) => Math.max(0, prev - 1));
        setUpvoted(false);
      } else {
        await supabase
          .from('idea_upvotes')
          .insert({ idea_id: idea.id, user_id: currentUserId } as never);

        await supabase
          .from('ideas')
          .update({ upvotes: upvoteCount + 1 } as never)
          .eq('id', idea.id);

        setUpvoteCount((prev) => prev + 1);
        setUpvoted(true);
      }
      onUpvote?.(idea.id);
    } catch (err) {
      console.error('Upvote error:', err);
    } finally {
      setUpvoting(false);
    }
  }

  function handleInterested(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onInterested?.(idea);
  }

  const author = idea.author;
  const stageLabelKey = idea.stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction';

  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-3">
        {/* Title + Stage badge */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/${locale}/ideas/${idea.id}`}
            className="text-sm font-bold text-foreground hover:underline line-clamp-2 flex-1"
          >
            {idea.title}
          </Link>
          {idea.stage && (
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium shrink-0',
                stageColors[idea.stage] ?? 'bg-secondary text-secondary-foreground'
              )}
            >
              {tStages(stageLabelKey)}
            </span>
          )}
        </div>

        {/* Description snippet */}
        {idea.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncate(idea.description, 120)}
          </p>
        )}

        {/* Industries */}
        {idea.industries.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.industries.slice(0, 3).map((industry) => (
              <Badge
                key={industry}
                variant="outline"
                className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
              >
                {industry}
              </Badge>
            ))}
            {idea.industries.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] font-normal px-1.5 py-0 h-4 rounded-full"
              >
                +{idea.industries.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Country focus flags */}
        {idea.country_focus.length > 0 && (
          <div className="flex items-center gap-1.5">
            {idea.country_focus.map((code) => (
              <span key={code} className="text-sm" title={code}>
                {getCountryFlag(code)}
              </span>
            ))}
          </div>
        )}

        {/* Author row */}
        {author && (
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/${locale}/profile/${author.id}`}
              className="flex items-center gap-2 group"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatar_url ?? undefined} alt={author.full_name ?? ''} />
                <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                  {author.full_name ? getInitials(author.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {author.full_name}
              </span>
            </Link>
            <span className="text-[10px] text-muted-foreground/60 ml-auto">
              {formatRelativeTime(idea.created_at)}
            </span>
          </div>
        )}

        {/* Stats + Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant={upvoted ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs gap-1 px-2"
            onClick={handleUpvote}
            disabled={!currentUserId || upvoting}
          >
            <ArrowUp className={cn('h-3 w-3', upvoted && 'text-primary-foreground')} />
            {upvoteCount}
          </Button>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {idea.views}
          </div>

          <div className="flex gap-1.5 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 px-2"
              onClick={handleInterested}
              disabled={!currentUserId || idea.author_id === currentUserId}
            >
              <HandHelping className="h-3 w-3" />
              <span className="hidden sm:inline">{t('interested')}</span>
            </Button>

            <Link href={`/${locale}/ideas/${idea.id}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2">
                <ArrowRight className="h-3 w-3" />
                <span className="hidden sm:inline">{t('viewDetails')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
