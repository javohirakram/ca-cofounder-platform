import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { IdeasContent } from '@/components/ideas/IdeasContent';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Idea, Profile } from '@/types/database';

type IdeaWithAuthor = Idea & { author?: Profile | null };

export default async function IdeasPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('ideas');
  const supabase = createServerSupabaseClient();

  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Fetch ideas with author profiles joined
  const { data: ideasData } = await supabase
    .from('ideas')
    .select('*, author:profiles!ideas_author_id_fkey(*)')
    .order('created_at', { ascending: false });

  const ideas: IdeaWithAuthor[] = (ideasData ?? []).map((item: Record<string, unknown>) => {
    const { author, ...rest } = item;
    return {
      ...rest,
      author: author ?? null,
    };
  }) as IdeaWithAuthor[];

  // Fetch user upvotes if logged in
  let userUpvotedIds: string[] = [];
  if (currentUserId) {
    const { data: upvotes } = await supabase
      .from('idea_upvotes')
      .select('idea_id')
      .eq('user_id', currentUserId);

    userUpvotedIds = (upvotes ?? []).map((u: { idea_id: string }) => u.idea_id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={
          <Link href={`/${params.locale}/ideas/new`}>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t('postIdea')}
            </Button>
          </Link>
        }
      />

      <IdeasContent
        initialIdeas={ideas}
        currentUserId={currentUserId}
        userUpvotedIds={userUpvotedIds}
      />
    </div>
  );
}
