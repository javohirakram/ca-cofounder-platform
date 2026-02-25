'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SkillsInput } from '@/components/profile/SkillsInput';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import type { Profile } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  headline: z.string().max(120).optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  role: z.array(z.string()),
  skills: z.array(z.string()),
  industries: z.array(z.string()),
  languages: z.array(z.string()),
  commitment: z.string().optional().or(z.literal('')),
  idea_stage: z.string().optional().or(z.literal('')),
  looking_for_roles: z.array(z.string()),
  looking_for_description: z.string().max(500).optional().or(z.literal('')),
  equity_min: z.number().min(0).max(100).optional().nullable(),
  equity_max: z.number().min(0).max(100).optional().nullable(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  telegram_handle: z.string().max(100).optional().or(z.literal('')),
  ecosystem_tags: z.array(z.string()),
  is_actively_looking: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const COUNTRIES = [
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TM', label: 'Turkmenistan' },
];

const ROLES = ['technical', 'business', 'design', 'product', 'operations'];

const INDUSTRIES = [
  'Fintech', 'Edtech', 'Healthtech', 'Agritech', 'E-commerce',
  'Logistics', 'AI/ML', 'SaaS', 'Marketplace', 'Social',
  'Gaming', 'Crypto/Web3', 'Cleantech', 'Proptech', 'Legaltech',
];

const LANGUAGES = ['English', 'Russian', 'Uzbek', 'Kazakh', 'Kyrgyz', 'Tajik', 'Turkmen'];

const IDEA_STAGES = ['no_idea', 'have_idea', 'concept', 'prototype', 'side_project', 'early_traction'];

const COMMITMENTS = ['full_time', 'part_time', 'exploring'];

const ECOSYSTEM_TAGS = [
  'Astana Hub', 'MOST', 'Techstars', 'NURIS', 'IT Park Uzbekistan',
  'Google for Startups', 'YC Alumni', 'Plug and Play',
];

interface ProfileFormProps {
  profile: Profile;
}

function calculateCompleteness(data: ProfileFormData): number {
  let score = 0;
  const total = 12;

  if (data.full_name && data.full_name.length >= 2) score++;
  if (data.headline && data.headline.length > 0) score++;
  if (data.bio && data.bio.length > 0) score++;
  if (data.country) score++;
  if (data.city && data.city.length > 0) score++;
  if (data.role.length > 0) score++;
  if (data.skills.length > 0) score++;
  if (data.industries.length > 0) score++;
  if (data.commitment) score++;
  if (data.looking_for_roles.length > 0) score++;
  if (data.languages.length > 0) score++;
  if (data.linkedin_url || data.telegram_handle) score++;

  return Math.round((score / total) * 100);
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const tStages = useTranslations('stages');
  const tCommitments = useTranslations('commitments');
  const tCountries = useTranslations('countries');
  const tProfile = useTranslations('profile');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: profile.full_name ?? '',
      headline: profile.headline ?? '',
      bio: profile.bio ?? '',
      country: profile.country ?? '',
      city: profile.city ?? '',
      role: profile.role ?? [],
      skills: profile.skills ?? [],
      industries: profile.industries ?? [],
      languages: profile.languages ?? [],
      commitment: profile.commitment ?? '',
      idea_stage: profile.idea_stage ?? '',
      looking_for_roles: profile.looking_for_roles ?? [],
      looking_for_description: profile.looking_for_description ?? '',
      equity_min: profile.equity_min,
      equity_max: profile.equity_max,
      linkedin_url: profile.linkedin_url ?? '',
      telegram_handle: profile.telegram_handle ?? '',
      ecosystem_tags: profile.ecosystem_tags ?? [],
      is_actively_looking: profile.is_actively_looking ?? false,
    },
  });

  const watchedValues = watch();
  const completeness = calculateCompleteness(watchedValues);

  // Auto-save on blur for text fields
  const autoSave = useCallback(
    async (field: keyof ProfileFormData, value: string) => {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ [field]: value, updated_at: new Date().toISOString() } as never)
        .eq('id', profile.id);
    },
    [profile.id]
  );

  // Show saved indicator briefly
  useEffect(() => {
    if (saved) {
      const timeout = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [saved]);

  async function onSubmit(data: ProfileFormData) {
    setSaving(true);
    try {
      const supabase = createClient();
      const profileCompleteness = calculateCompleteness(data);

      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          avatar_url: avatarUrl,
          profile_completeness: profileCompleteness,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', profile.id);

      if (error) throw error;
      setSaved(true);
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  }

  function toggleArrayItem(field: 'role' | 'industries' | 'languages' | 'looking_for_roles' | 'ecosystem_tags', item: string) {
    const current = watchedValues[field] as string[];
    const updated = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];
    setValue(field, updated, { shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Completeness */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {tProfile('completeness')}
          </span>
          <span className={cn(
            'text-sm font-semibold',
            completeness >= 80 ? 'text-emerald-600' : completeness >= 50 ? 'text-amber-600' : 'text-muted-foreground'
          )}>
            {completeness}%
          </span>
        </div>
        <Progress value={completeness} className="h-2" />
      </div>

      {/* Section: Basic Info */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-foreground">{t('step1Title')}</h2>
        <Separator />

        {/* Avatar */}
        <AvatarUpload
          url={avatarUrl}
          userId={profile.id}
          userName={watchedValues.full_name}
          onUpload={(url) => setAvatarUrl(url)}
        />

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="full_name">{t('fullName')}</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            onBlur={(e) => autoSave('full_name', e.target.value)}
            className={cn(errors.full_name && 'border-destructive')}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <Label htmlFor="headline">{t('headline')}</Label>
          <Input
            id="headline"
            placeholder={t('headlinePlaceholder')}
            {...register('headline')}
            onBlur={(e) => autoSave('headline', e.target.value)}
          />
        </div>

        {/* Country + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('country')}</Label>
            <Select
              value={watchedValues.country}
              onValueChange={(v) => {
                setValue('country', v, { shouldDirty: true });
                autoSave('country', v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('country')} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {tCountries(c.label as 'Kazakhstan' | 'Kyrgyzstan' | 'Uzbekistan' | 'Tajikistan' | 'Turkmenistan')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">{t('city')}</Label>
            <Input
              id="city"
              {...register('city')}
              onBlur={(e) => autoSave('city', e.target.value)}
            />
          </div>
        </div>

        {/* Primary Role */}
        <div className="space-y-2">
          <Label>{t('primaryRole')}</Label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => {
              const isSelected = watchedValues.role.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleArrayItem('role', role)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
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
        </div>
      </section>

      {/* Section: Background */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-foreground">{t('step2Title')}</h2>
        <Separator />

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">{t('step2Title')}</Label>
          <Textarea
            id="bio"
            rows={4}
            {...register('bio')}
            onBlur={(e) => autoSave('bio', e.target.value)}
            className="resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            {(watchedValues.bio ?? '').length}/1000
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <Label>{t('skills')}</Label>
          <SkillsInput
            value={watchedValues.skills}
            onChange={(skills) => setValue('skills', skills, { shouldDirty: true })}
          />
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label>{t('languagesSpoken')}</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = watchedValues.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayItem('languages', lang)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-accent'
                  )}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section: Startup Context */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-foreground">{t('step3Title')}</h2>
        <Separator />

        {/* Idea Stage */}
        <div className="space-y-1.5">
          <Label>{t('ideaStage')}</Label>
          <Select
            value={watchedValues.idea_stage}
            onValueChange={(v) => setValue('idea_stage', v, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('ideaStage')} />
            </SelectTrigger>
            <SelectContent>
              {IDEA_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {tStages(stage as 'no_idea' | 'have_idea' | 'concept' | 'prototype' | 'side_project' | 'early_traction')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Industries */}
        <div className="space-y-2">
          <Label>{t('industryInterests')}</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => {
              const isSelected = watchedValues.industries.includes(industry);
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => toggleArrayItem('industries', industry)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
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
        </div>

        {/* Commitment */}
        <div className="space-y-1.5">
          <Label>{t('commitment')}</Label>
          <Select
            value={watchedValues.commitment}
            onValueChange={(v) => setValue('commitment', v, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('commitment')} />
            </SelectTrigger>
            <SelectContent>
              {COMMITMENTS.map((c) => (
                <SelectItem key={c} value={c}>
                  {tCommitments(c as 'full_time' | 'part_time' | 'exploring')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ecosystem Tags */}
        <div className="space-y-2">
          <Label>{t('ecosystemTags')}</Label>
          <div className="flex flex-wrap gap-2">
            {ECOSYSTEM_TAGS.map((tag) => {
              const isSelected = watchedValues.ecosystem_tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArrayItem('ecosystem_tags', tag)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-accent'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section: Looking For */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-foreground">{t('step4Title')}</h2>
        <Separator />

        {/* Looking for roles */}
        <div className="space-y-2">
          <Label>{t('cofounderRoles')}</Label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => {
              const isSelected = watchedValues.looking_for_roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleArrayItem('looking_for_roles', role)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
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
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="looking_for_description">{t('idealCofounder')}</Label>
          <Textarea
            id="looking_for_description"
            rows={3}
            {...register('looking_for_description')}
            onBlur={(e) => autoSave('looking_for_description', e.target.value)}
            className="resize-none"
          />
        </div>

        {/* Equity Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="equity_min">{t('equityRange')} (min %)</Label>
            <Input
              id="equity_min"
              type="number"
              min={0}
              max={100}
              {...register('equity_min', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="equity_max">{t('equityRange')} (max %)</Label>
            <Input
              id="equity_max"
              type="number"
              min={0}
              max={100}
              {...register('equity_max', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Actively Looking */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">{t('searchStage')}</p>
            <p className="text-xs text-muted-foreground">
              {watchedValues.is_actively_looking ? 'Actively seeking a co-founder' : 'Not actively looking'}
            </p>
          </div>
          <Switch
            checked={watchedValues.is_actively_looking}
            onCheckedChange={(checked) => setValue('is_actively_looking', checked, { shouldDirty: true })}
          />
        </div>
      </section>

      {/* Section: Contact */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-foreground">{t('step5Title')}</h2>
        <Separator />

        <div className="space-y-1.5">
          <Label htmlFor="linkedin_url">{t('linkedinUrl')}</Label>
          <Input
            id="linkedin_url"
            type="url"
            placeholder="https://linkedin.com/in/..."
            {...register('linkedin_url')}
            onBlur={(e) => autoSave('linkedin_url', e.target.value)}
            className={cn(errors.linkedin_url && 'border-destructive')}
          />
          {errors.linkedin_url && (
            <p className="text-xs text-destructive">{errors.linkedin_url.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telegram_handle">{t('telegramHandle')}</Label>
          <Input
            id="telegram_handle"
            placeholder="@username"
            {...register('telegram_handle')}
            onBlur={(e) => autoSave('telegram_handle', e.target.value)}
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {tCommon('loading')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {tCommon('save')}
            </>
          )}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {tCommon('success')}
          </span>
        )}
      </div>
    </form>
  );
}
