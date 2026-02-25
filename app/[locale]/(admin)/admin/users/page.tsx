'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Shield,
  ShieldOff,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const COUNTRIES = [
  'Kazakhstan',
  'Kyrgyzstan',
  'Uzbekistan',
  'Tajikistan',
  'Turkmenistan',
];
const ROLES = ['technical', 'business', 'design', 'product', 'operations'];
const PAGE_SIZE = 20;

type SortField = 'created_at' | 'last_active';
type SortOrder = 'asc' | 'desc';

export default function AdminUsersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const supabase = createClient();

  const [users, setUsers] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);

  // Confirm dialog state
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search.trim()}%,headline.ilike.%${search.trim()}%`
      );
    }

    // Apply country filter
    if (countryFilter && countryFilter !== 'all') {
      query = query.eq('country', countryFilter);
    }

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      query = query.contains('role', [roleFilter]);
    }

    // Apply sort
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setUsers(data);
      setTotalCount(count ?? 0);
    }

    setLoading(false);
  }, [search, countryFilter, roleFilter, sortField, sortOrder, page, supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, countryFilter, roleFilter]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function getInitials(name: string | null): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  }

  async function handleToggleAdmin(user: Profile) {
    setConfirmDialog({
      open: true,
      title: t('toggleAdmin'),
      description: `Are you sure you want to ${user.is_admin ? 'remove' : 'grant'} admin access for ${user.full_name ?? 'this user'}?`,
      variant: 'default',
      onConfirm: async () => {
        const { error } = await (supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('profiles') as any)
          .update({ is_admin: !user.is_admin })
          .eq('id', user.id);

        if (!error) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, is_admin: !u.is_admin } : u
            )
          );
        }
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }

  async function handleToggleActiveLooking(user: Profile) {
    const { error } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('profiles') as any)
      .update({ is_actively_looking: !user.is_actively_looking })
      .eq('id', user.id);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, is_actively_looking: !u.is_actively_looking }
            : u
        )
      );
    }
  }

  async function handleDeleteUser(user: Profile) {
    setConfirmDialog({
      open: true,
      title: t('deleteUser'),
      description: `This will permanently delete ${user.full_name ?? 'this user'} and all their data. This action cannot be undone.`,
      variant: 'destructive',
      onConfirm: async () => {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (!error) {
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
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
        <h1 className="text-2xl font-bold tracking-tight">{t('users')}</h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} total users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Country</th>
              <th className="px-4 py-3 text-left font-medium">Roles</th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  onClick={() => handleSort('created_at')}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Created
                  <SortIcon field="created_at" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  onClick={() => handleSort('last_active')}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Last Active
                  <SortIcon field="last_active" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-5 w-full animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tCommon('noResults')}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {user.avatar_url && (
                          <AvatarImage
                            src={user.avatar_url}
                            alt={user.full_name ?? ''}
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {user.full_name ?? 'Unnamed'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.headline ?? '-'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Country */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.country ?? '-'}
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.role && user.role.length > 0 ? (
                        user.role.map((r) => (
                          <Badge
                            key={r}
                            variant="secondary"
                            className="text-xs"
                          >
                            {r}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(user.last_active)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.is_admin && (
                        <Badge variant="default" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      {user.is_actively_looking && (
                        <Badge variant="outline" className="text-xs">
                          Looking
                        </Badge>
                      )}
                    </div>
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
                            href={`/${locale}/profile/${user.id}`}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t('viewProfile')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleAdmin(user)}
                          className="cursor-pointer"
                        >
                          {user.is_admin ? (
                            <>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActiveLooking(user)}
                          className="cursor-pointer"
                        >
                          {user.is_actively_looking ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Set Not Looking
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Set Actively Looking
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('deleteUser')}
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
