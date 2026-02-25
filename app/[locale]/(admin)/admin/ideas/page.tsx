'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import type { Idea } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Eye,
} from 'lucide-react';

const PAGE_SIZE = 20;

interface IdeaWithAuthor extends Idea {
  profiles: { full_name: string | null } | null;
}

export default function AdminIdeasPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const supabase = createClient();

  const [ideas, setIdeas] = useState<IdeaWithAuthor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'default' | 'destructive';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'default',
    onConfirm: () => {},
  });

  const fetchIdeas = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('ideas')
      .select('*, profiles!ideas_author_id_fkey(full_name)', { count: 'exact' });

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    query = query.order('created_at', { ascending: false });

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setIdeas(data as IdeaWithAuthor[]);
      setTotalCount(count ?? 0);
    }

    setLoading(false);
  }, [search, page, supabase]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async function handleToggleOpen(idea: IdeaWithAuthor) {
    const { error } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('ideas') as any)
      .update({ is_open: !idea.is_open })
      .eq('id', idea.id);

    if (!error) {
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === idea.id ? { ...i, is_open: !i.is_open } : i
        )
      );
    }
  }

  async function handleDeleteIdea(idea: IdeaWithAuthor) {
    setConfirmDialog({
      open: true,
      title: t('deleteIdea'),
      description: `This will permanently delete the idea "${idea.title}". This action cannot be undone.`,
      variant: 'destructive',
      onConfirm: async () => {
        const { error } = await supabase
          .from('ideas')
          .delete()
          .eq('id', idea.id);

        if (!error) {
          setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
          setTotalCount((prev) => prev - 1);
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('ideas')}</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} total ideas
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search ideas by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Author</th>
              <th className="px-4 py-3 text-left font-medium">Industries</th>
              <th className="px-4 py-3 text-left font-medium">Stage</th>
              <th className="px-4 py-3 text-center font-medium">
                <ThumbsUp className="mx-auto h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-center font-medium">
                <Eye className="mx-auto h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan={9} className="px-4 py-4">
                    <div className="h-5 w-full animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : ideas.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tCommon('noResults')}
                </td>
              </tr>
            ) : (
              ideas.map((idea) => (
                <tr
                  key={idea.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  {/* Title */}
                  <td className="max-w-[240px] px-4 py-3">
                    <p className="truncate font-medium">{idea.title}</p>
                  </td>

                  {/* Author */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {idea.profiles?.full_name ?? 'Unknown'}
                  </td>

                  {/* Industries */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {idea.industries && idea.industries.length > 0 ? (
                        idea.industries.slice(0, 2).map((ind) => (
                          <Badge
                            key={ind}
                            variant="secondary"
                            className="text-xs"
                          >
                            {ind}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                      {idea.industries && idea.industries.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{idea.industries.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {idea.stage ?? '-'}
                  </td>

                  {/* Upvotes */}
                  <td className="px-4 py-3 text-center">{idea.upvotes}</td>

                  {/* Views */}
                  <td className="px-4 py-3 text-center">{idea.views}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge
                      variant={idea.is_open ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {idea.is_open ? 'Open' : 'Closed'}
                    </Badge>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(idea.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/${locale}/ideas/${idea.id}`}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Idea
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleOpen(idea)}
                          className="cursor-pointer"
                        >
                          {idea.is_open ? (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Close Idea
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Reopen Idea
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteIdea(idea)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('deleteIdea')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              {tCommon('previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              {tCommon('next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant={confirmDialog.variant}
              onClick={confirmDialog.onConfirm}
            >
              {tCommon('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
