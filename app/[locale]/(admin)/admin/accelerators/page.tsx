'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import type { Accelerator } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  MapPin,
  Users,
  ExternalLink,
} from 'lucide-react';

const COUNTRIES = [
  'Kazakhstan',
  'Kyrgyzstan',
  'Uzbekistan',
  'Tajikistan',
  'Turkmenistan',
];

interface AcceleratorWithCount extends Accelerator {
  member_count: number;
}

interface AcceleratorFormData {
  name: string;
  description: string;
  logo_url: string;
  website: string;
  country: string;
  city: string;
}

const emptyForm: AcceleratorFormData = {
  name: '',
  description: '',
  logo_url: '',
  website: '',
  country: '',
  city: '',
};

export default function AdminAcceleratorsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const supabase = createClient();

  const [accelerators, setAccelerators] = useState<AcceleratorWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AcceleratorFormData>(emptyForm);

  // Delete confirm dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    accelerator: AcceleratorWithCount | null;
  }>({
    open: false,
    accelerator: null,
  });

  const fetchAccelerators = useCallback(async () => {
    setLoading(true);

    const { data: accs, error } = await supabase
      .from('accelerators')
      .select('*')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .order('created_at', { ascending: false }) as { data: Accelerator[] | null, error: any };

    if (error || !accs) {
      setLoading(false);
      return;
    }

    // Fetch member counts for each accelerator
    const accIds = accs.map((a) => a.id);
    const countPromises = accIds.map((id) =>
      supabase
        .from('accelerator_members')
        .select('*', { count: 'exact', head: true })
        .eq('accelerator_id', id)
    );

    const countResults = await Promise.all(countPromises);

    const withCounts: AcceleratorWithCount[] = accs.map((acc, i) => ({
      ...acc,
      member_count: countResults[i].count ?? 0,
    }));

    setAccelerators(withCounts);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAccelerators();
  }, [fetchAccelerators]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditDialog(acc: AcceleratorWithCount) {
    setEditingId(acc.id);
    setForm({
      name: acc.name,
      description: acc.description ?? '',
      logo_url: acc.logo_url ?? '',
      website: acc.website ?? '',
      country: acc.country ?? '',
      city: acc.city ?? '',
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      logo_url: form.logo_url.trim() || null,
      website: form.website.trim() || null,
      country: form.country || null,
      city: form.city.trim() || null,
    };

    if (editingId) {
      // Update
      const { error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('accelerators') as any)
        .update(payload)
        .eq('id', editingId);

      if (!error) {
        setAccelerators((prev) =>
          prev.map((a) =>
            a.id === editingId ? { ...a, ...payload } : a
          )
        );
        setFormOpen(false);
      }
    } else {
      // Create
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('accelerators') as any)
        .insert(payload)
        .select()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as { data: Accelerator | null, error: any };

      if (!error && data) {
        setAccelerators((prev) => [
          { ...data, member_count: 0 },
          ...prev,
        ]);
        setFormOpen(false);
      }
    }

    setSaving(false);
  }

  async function handleDelete() {
    const acc = deleteDialog.accelerator;
    if (!acc) return;

    const { error } = await supabase
      .from('accelerators')
      .delete()
      .eq('id', acc.id);

    if (!error) {
      setAccelerators((prev) => prev.filter((a) => a.id !== acc.id));
    }
    setDeleteDialog({ open: false, accelerator: null });
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('accelerators')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {accelerators.length} accelerator{accelerators.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createAccelerator')}
        </Button>
      </div>

      {/* Accelerators list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-40 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accelerators.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground">No accelerators yet</p>
          <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createAccelerator')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accelerators.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {acc.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={acc.logo_url}
                        alt={acc.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{acc.name}</h3>
                      <Badge
                        variant={acc.is_active ? 'default' : 'secondary'}
                        className="mt-1 text-xs"
                      >
                        {acc.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(acc)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {tCommon('edit')}
                      </DropdownMenuItem>
                      {acc.website && (
                        <DropdownMenuItem asChild>
                          <a
                            href={acc.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Website
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setDeleteDialog({ open: true, accelerator: acc })
                        }
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {tCommon('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {acc.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {acc.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {(acc.country || acc.city) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[acc.city, acc.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {acc.member_count} member{acc.member_count !== 1 ? 's' : ''}
                  </span>
                  {acc.website && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Created {formatDate(acc.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t('editAccelerator') : t('createAccelerator')}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the accelerator details below.'
                : 'Fill in the details to create a new accelerator.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="acc-name">Name *</Label>
              <Input
                id="acc-name"
                placeholder="Accelerator name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="acc-desc">Description</Label>
              <Textarea
                id="acc-desc"
                placeholder="Brief description of the accelerator..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Logo URL */}
            <div className="grid gap-2">
              <Label htmlFor="acc-logo">Logo URL</Label>
              <Input
                id="acc-logo"
                placeholder="https://example.com/logo.png"
                value={form.logo_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, logo_url: e.target.value }))
                }
              />
            </div>

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="acc-website">Website</Label>
              <Input
                id="acc-website"
                placeholder="https://example.com"
                value={form.website}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, website: e.target.value }))
                }
              />
            </div>

            {/* Country + City row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Country</Label>
                <Select
                  value={form.country}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, country: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acc-city">City</Label>
                <Input
                  id="acc-city"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Saving...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Accelerator</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.accelerator?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, accelerator: null })
              }
            >
              {tCommon('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
