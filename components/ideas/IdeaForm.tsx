'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import { cn, getCountryFlag } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Eye, Edit3 } from 'lucide-react';
import type { Idea } from '@/types/database';

const INDUSTRIES = [
  'Fintech', 'Edtech', 'Healthtech', 'Agritech', 'E-commerce',
  'Logistics', 'AI/ML', 'SaaS', 'Marketplace', 'Social',
];

const COUNTRIES = [
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TM', label: 'Turkmenistan' },
];

const STAGES = ['no_idea', 'have_idea', 'concept', 'prototype', 'side_project', 'early_traction'];

const ROLES = ['technical', 'business', 'design', 'product', 'operations'];

const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be at most 120 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be at most 2000 characters'),
  problem: z.string().min(10, 'Problem must be at least 10 characters').max(1000, 'Problem must be at most 1000 characters'),
  solution: z.string().min(10, 'Solution must be at least 10 characters').max(1000, 'Solution must be at most 1000 characters'),
  stage: z.string().min(1, 'Please select a stage'),
  industries: z.array(z.string()).min(1, 'Select at least one industry'),
  country_focus: z.array(z.string()).min(1, 'Select at least one country'),
  looking_for_roles: z.array(z.string()).min(1, 'Select at least one role'),
  looking_for_description: z.string().max(500, 'Description must be at most 500 characters').optional(),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

interface IdeaFormProps {
  initialData?: Partial<Idea>;
  ideaId?: string;
}

export function IdeaForm({ initialData, ideaId }: IdeaFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('ideas');
  const tCommon = useTranslations('common');
  const tStages = useTranslations('stages');
  const tRoles = useTranslations('roles');

  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IdeaFormData>({
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      problem: initialData?.problem ?? '',
      solution: initialData?.solution ?? '',
      stage: initialData?.stage ?? '',
      industries: initialData?.industries ?? [],
      country_focus: initialData?.country_focus ?? [],
      looking_for_roles: initialData?.looking_for_roles ?? [],
      looking_for_description: initialData?.looking_for_description ?? '',
    },
  });

  const watchedValues = watch();

  function toggleArrayField(field: 'industries' | 'country_focus' | 'looking_for_roles', value: string) {
    const current = watchedValues[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, updated, { shouldValidate: true });
  }

  async function onSubmit(data: IdeaFormData) {
    setError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('You must be logged in to post an idea.');
        return;
      }

      if (ideaId) {
        const { error: updateError } = await supabase
          .from('ideas')
          .update({
            title: data.title,
            description: data.description,
            problem: data.problem,
            solution: data.solution,
            stage: data.stage,
            industries: data.industries,
            country_focus: data.country_focus,
            looking_for_roles: data.looking_for_roles,
            looking_for_description: data.looking_for_description ?? null,
          } as never)
          .eq('id', ideaId);

        if (updateError) throw updateError;
        router.push(`/${locale}/ideas/${ideaId}`);
      } else {
        const { data: newIdea, error: insertError } = await supabase
          .from('ideas')
          .insert({
            author_id: session.user.id,
            title: data.title,
            description: data.description,
            problem: data.problem,
            solution: data.solution,
            stage: data.stage,
            industries: data.industries,
            country_focus: data.country_focus,
            looking_for_roles: data.looking_for_roles,
            looking_for_description: data.looking_for_description ?? null,
            is_open: true,
            upvotes: 0,
            views: 0,
          } as never)
          .select('id')
          .single();

        if (insertError) throw insertError;

        const created = newIdea as { id: string } | null;
        if (created) {
          router.push(`/${locale}/ideas/${created.id}`);
        } else {
          router.push(`/${locale}/ideas`);
        }
      }
    } catch (err) {
      console.error('Submit idea error:', err);
      setError('Failed to publish idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const validationResult = ideaSchema.safeParse(watchedValues);

  if (preview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('preview')}</h2>
          <Button variant="outline" size="sm" onClick={() => setPreview(false)} className="gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            {tCommon('edit')}
          </Button>
        </div>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">{watchedValues.title || 'Untitled'}</CardTitle>
            <div className="flex items-center gap-2 pt-1">
              {watchedValues.stage && (
                <Badge variant="secondary" className="text-xs">
                  {tStages(watchedValues.stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction')}
                </Badge>
              )}
              {watchedValues.country_focus.map((code) => (
                <span key={code} className="text-sm">
                  {getCountryFlag(code)}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {watchedValues.description && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">{t('ideaDescription')}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{watchedValues.description}</p>
              </div>
            )}

            <Separator />

            {watchedValues.problem && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">{t('problem')}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{watchedValues.problem}</p>
              </div>
            )}

            {watchedValues.solution && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">{t('solution')}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{watchedValues.solution}</p>
              </div>
            )}

            <Separator />

            {watchedValues.industries.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">{t('ideaIndustries')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {watchedValues.industries.map((industry) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {watchedValues.looking_for_roles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">{t('lookingFor')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {watchedValues.looking_for_roles.map((role) => (
                    <Badge key={role} className="text-xs">
                      {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                    </Badge>
                  ))}
                </div>
                {watchedValues.looking_for_description && (
                  <p className="text-sm text-muted-foreground mt-2">{watchedValues.looking_for_description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPreview(false)} className="flex-1">
            {tCommon('edit')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={submitting || !validationResult.success}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                {tCommon('loading')}
              </>
            ) : (
              t('publish')
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t('ideaTitle')}</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="A concise title for your startup idea"
          className="h-10"
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('ideaDescription')}</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your startup idea in detail..."
          rows={4}
          className="resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Problem */}
      <div className="space-y-2">
        <Label htmlFor="problem">{t('ideaProblem')}</Label>
        <Textarea
          id="problem"
          {...register('problem')}
          placeholder="What problem does this idea solve?"
          rows={3}
          className="resize-none"
        />
        {errors.problem && (
          <p className="text-xs text-destructive">{errors.problem.message}</p>
        )}
      </div>

      {/* Solution */}
      <div className="space-y-2">
        <Label htmlFor="solution">{t('ideaSolution')}</Label>
        <Textarea
          id="solution"
          {...register('solution')}
          placeholder="What is the proposed solution?"
          rows={3}
          className="resize-none"
        />
        {errors.solution && (
          <p className="text-xs text-destructive">{errors.solution.message}</p>
        )}
      </div>

      {/* Stage */}
      <div className="space-y-2">
        <Label>{t('ideaStage')}</Label>
        <Select
          value={watchedValues.stage}
          onValueChange={(value) => setValue('stage', value, { shouldValidate: true })}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select a stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {tStages(stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stage && (
          <p className="text-xs text-destructive">{errors.stage.message}</p>
        )}
      </div>

      {/* Industries (multi-select) */}
      <div className="space-y-2">
        <Label>{t('ideaIndustries')}</Label>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((industry) => {
            const isSelected = watchedValues.industries.includes(industry);
            return (
              <button
                key={industry}
                type="button"
                onClick={() => toggleArrayField('industries', industry)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {industry}
              </button>
            );
          })}
        </div>
        {errors.industries && (
          <p className="text-xs text-destructive">{errors.industries.message}</p>
        )}
      </div>

      {/* Country Focus (multi-select) */}
      <div className="space-y-2">
        <Label>{t('ideaCountryFocus')}</Label>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((country) => {
            const isSelected = watchedValues.country_focus.includes(country.value);
            return (
              <button
                key={country.value}
                type="button"
                onClick={() => toggleArrayField('country_focus', country.value)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors gap-1 inline-flex items-center',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                <span>{getCountryFlag(country.value)}</span>
                {country.label}
              </button>
            );
          })}
        </div>
        {errors.country_focus && (
          <p className="text-xs text-destructive">{errors.country_focus.message}</p>
        )}
      </div>

      {/* Looking For Roles (multi-select) */}
      <div className="space-y-2">
        <Label>{t('ideaRoles')}</Label>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => {
            const isSelected = watchedValues.looking_for_roles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleArrayField('looking_for_roles', role)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
              </button>
            );
          })}
        </div>
        {errors.looking_for_roles && (
          <p className="text-xs text-destructive">{errors.looking_for_roles.message}</p>
        )}
      </div>

      {/* Looking For Description */}
      <div className="space-y-2">
        <Label htmlFor="looking_for_description">{t('ideaRolesDesc')}</Label>
        <Textarea
          id="looking_for_description"
          {...register('looking_for_description')}
          placeholder="Describe what kind of co-founder you're looking for..."
          rows={3}
          className="resize-none"
        />
        {errors.looking_for_description && (
          <p className="text-xs text-destructive">{errors.looking_for_description.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreview(true)}
          disabled={!validationResult.success}
          className="flex-1 gap-1.5"
        >
          <Eye className="h-4 w-4" />
          {t('preview')}
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              {tCommon('loading')}
            </>
          ) : (
            t('publish')
          )}
        </Button>
      </div>
    </form>
  );
}
