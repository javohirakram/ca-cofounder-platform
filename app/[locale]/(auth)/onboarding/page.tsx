'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { SkillsInput } from '@/components/profile/SkillsInput';
import { cn } from '@/lib/utils';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Rocket,
  Zap,
  Code,
  Clock,
  Search,
  AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  current: boolean;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  graduationYear: string;
}

interface OnboardingData {
  // Step 1
  fullName: string;
  avatarUrl: string | null;
  country: string;
  city: string;
  headline: string;
  // Step 2
  primaryRoles: string[];
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  // Step 3
  ideaStage: string;
  industryInterests: string[];
  ecosystemTags: string[];
  ideaDescription: string;
  // Step 4
  cofounderRoles: string[];
  idealCofounder: string;
  equityMin: number;
  equityMax: number;
  searchStage: string;
  // Step 5
  commitment: string;
  languages: string[];
  telegramHandle: string;
  linkedinUrl: string;
  emailNotifications: boolean;
  telegramNotifications: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TM', label: 'Turkmenistan' },
];

const ROLES = ['technical', 'business', 'design', 'product', 'operations'];

const IDEA_STAGES = [
  { value: 'no_idea', icon: Lightbulb, description: 'Exploring options, open to any idea' },
  { value: 'have_idea', icon: Rocket, description: 'Have a concept, looking for co-founders' },
  { value: 'early_traction', icon: Zap, description: 'Already have users or revenue' },
  { value: 'side_project', icon: Code, description: 'Building on the side, want to go full-time' },
];

const INDUSTRIES = [
  'Fintech',
  'Edtech',
  'Agritech',
  'Logistics',
  'Healthtech',
  'Ecommerce',
  'B2B SaaS',
  'Climate',
];

const ECOSYSTEM_TAGS = [
  'Astana Hub',
  'IT Park UZ',
  'AIFC',
  'UTECH',
  'MOST',
  'Silkway Accelerator',
];

const SEARCH_STAGES = [
  { value: 'just_starting', icon: Search, label: 'Just starting' },
  { value: 'been_searching', icon: Clock, label: 'Been searching' },
  { value: 'urgent', icon: AlertCircle, label: 'Urgent' },
];

const COMMITMENT_LEVELS = [
  {
    value: 'full_time',
    label: 'Full-time',
    description: 'Ready to go all-in, 40+ hours/week',
  },
  {
    value: 'part_time',
    label: 'Part-time',
    description: 'Can dedicate 10-20 hours/week alongside current work',
  },
  {
    value: 'exploring',
    label: 'Exploring',
    description: 'Testing the waters, flexible on commitment',
  },
];

const LANGUAGES = ['Russian', 'English', 'Kazakh', 'Uzbek', 'Kyrgyz', 'Tajik'];

const TOTAL_STEPS = 5;

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('onboarding');
  const tRoles = useTranslations('roles');
  const tStages = useTranslations('stages');

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    avatarUrl: null,
    country: '',
    city: '',
    headline: '',
    primaryRoles: [],
    skills: [],
    experience: [],
    education: [],
    ideaStage: '',
    industryInterests: [],
    ecosystemTags: [],
    ideaDescription: '',
    cofounderRoles: [],
    idealCofounder: '',
    equityMin: 10,
    equityMax: 50,
    searchStage: '',
    commitment: '',
    languages: [],
    telegramHandle: '',
    linkedinUrl: '',
    emailNotifications: true,
    telegramNotifications: true,
  });

  // Fetch current user on mount
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Pre-fill name from auth metadata
        if (user.user_metadata?.full_name) {
          setData((prev) => ({ ...prev, fullName: user.user_metadata.full_name }));
        }
      } else {
        // No authenticated user — redirect to login
        router.push(`/${locale}/login`);
      }
    }
    getUser();
  }, [locale, router]);

  function updateData<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: keyof OnboardingData, item: string) {
    setData((prev) => {
      const current = prev[key] as string[];
      const exists = current.includes(item);
      return {
        ...prev,
        [key]: exists ? current.filter((i) => i !== item) : [...current, item],
      };
    });
  }

  // ─── Save step data to Supabase ─────────────────────────────────────────

  async function saveStepData(currentStep: number): Promise<boolean> {
    if (!userId) {
      toast.error('Please sign in first.');
      return false;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      let updatePayload: Record<string, unknown> = {};

      switch (currentStep) {
        case 1:
          updatePayload = {
            full_name: data.fullName || null,
            avatar_url: data.avatarUrl,
            country: data.country || null,
            city: data.city || null,
            headline: data.headline || null,
          };
          break;
        case 2:
          updatePayload = {
            role: data.primaryRoles,
            skills: data.skills,
            experience: data.experience,
            education: data.education,
          };
          break;
        case 3:
          updatePayload = {
            idea_stage: data.ideaStage || null,
            industries: data.industryInterests,
            ecosystem_tags: data.ecosystemTags,
            bio: data.ideaDescription || null,
          };
          break;
        case 4:
          updatePayload = {
            looking_for_roles: data.cofounderRoles,
            looking_for_description: data.idealCofounder || null,
            equity_min: data.equityMin,
            equity_max: data.equityMax,
            is_actively_looking: true,
          };
          break;
        case 5:
          updatePayload = {
            commitment: data.commitment || null,
            languages: data.languages,
            telegram_handle: data.telegramHandle || null,
            linkedin_url: data.linkedinUrl || null,
            profile_completeness: 100,
          };
          break;
      }

      updatePayload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload as never)
        .eq('id', userId);

      if (error) {
        toast.error('Failed to save. Please try again.');
        console.error('Save error:', error);
        return false;
      }

      return true;
    } catch {
      toast.error('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  function validateStep(currentStep: number): boolean {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!data.fullName || data.fullName.length < 2) {
        errors.fullName = 'Name is required';
      }
      if (!data.country) {
        errors.country = 'Country is required';
      }
      if (!data.city || data.city.trim().length === 0) {
        errors.city = 'City is required';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const saved = await saveStepData(step);
    if (!saved) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      toast.success(t('welcome'));
      router.push(`/${locale}/discover`);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  // ─── Work Experience Helpers ─────────────────────────────────────────────

  function addExperience() {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', role: '', duration: '', current: false },
      ],
    }));
  }

  function updateExperience(index: number, field: keyof WorkExperience, value: string | boolean) {
    setData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  }

  function removeExperience(index: number) {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  // ─── Education Helpers ───────────────────────────────────────────────────

  function addEducation() {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', field: '', graduationYear: '' },
      ],
    }));
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    setData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  }

  function removeEducation(index: number) {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  // ─── Progress Calculation ────────────────────────────────────────────────

  const progressValue = (step / TOTAL_STEPS) * 100;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {t('title')}
          </span>
          <span className="text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
        <h2 className="text-lg font-semibold">
          {step === 1 && t('step1Title')}
          {step === 2 && t('step2Title')}
          {step === 3 && t('step3Title')}
          {step === 4 && t('step4Title')}
          {step === 5 && t('step5Title')}
        </h2>
      </div>

      {/* Step Content */}
      <div className="min-h-[320px]">
        {/* ── Step 1: Who are you? ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')} *</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => {
                  updateData('fullName', e.target.value);
                  if (stepErrors.fullName) setStepErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="John Doe"
                disabled={isLoading}
                className={cn(stepErrors.fullName && 'border-destructive')}
              />
              {stepErrors.fullName && (
                <p className="text-xs text-destructive">{stepErrors.fullName}</p>
              )}
            </div>

            {/* Avatar Upload */}
            {userId && (
              <AvatarUpload
                url={data.avatarUrl}
                userId={userId}
                userName={data.fullName}
                onUpload={(url) => updateData('avatarUrl', url)}
              />
            )}

            {/* Country */}
            <div className="space-y-2">
              <Label>{t('country')} *</Label>
              <Select
                value={data.country}
                onValueChange={(value) => {
                  updateData('country', value);
                  if (stepErrors.country) setStepErrors((prev) => ({ ...prev, country: '' }));
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={cn(stepErrors.country && 'border-destructive')}>
                  <SelectValue placeholder={t('country')} />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepErrors.country && (
                <p className="text-xs text-destructive">{stepErrors.country}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">{t('city')} *</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => {
                  updateData('city', e.target.value);
                  if (stepErrors.city) setStepErrors((prev) => ({ ...prev, city: '' }));
                }}
                placeholder="Almaty"
                disabled={isLoading}
                className={cn(stepErrors.city && 'border-destructive')}
              />
              {stepErrors.city && (
                <p className="text-xs text-destructive">{stepErrors.city}</p>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline">
                {t('headline')}{' '}
                <span className="text-xs text-muted-foreground">
                  ({data.headline.length}/100)
                </span>
              </Label>
              <Input
                id="headline"
                value={data.headline}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    updateData('headline', e.target.value);
                  }
                }}
                placeholder={t('headlinePlaceholder')}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Your background ───────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Primary Role */}
            <div className="space-y-2">
              <Label>{t('primaryRole')}</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleArrayItem('primaryRoles', role)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      data.primaryRoles.includes(role)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                    disabled={isLoading}
                  >
                    {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>{t('skills')}</Label>
              <SkillsInput
                value={data.skills}
                onChange={(skills) => updateData('skills', skills)}
              />
            </div>

            {/* Work Experience */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('workExperience')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addExperience}
                  disabled={isLoading}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('addExperience')}
                </Button>
              </div>

              {data.experience.map((exp, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      Experience {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeExperience(index)}
                      disabled={isLoading}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={t('company')}
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      disabled={isLoading}
                    />
                    <Input
                      placeholder={t('role')}
                      value={exp.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={t('duration')}
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) =>
                          updateExperience(index, 'current', e.target.checked)
                        }
                        className="rounded border-input"
                        disabled={isLoading}
                      />
                      {t('current')}
                    </label>
                  </div>
                </div>
              ))}

              {data.experience.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  No work experience added yet.
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('education')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addEducation}
                  disabled={isLoading}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('addEducation')}
                </Button>
              </div>

              {data.education.map((edu, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Education {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeEducation(index)}
                      disabled={isLoading}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={t('school')}
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      disabled={isLoading}
                    />
                    <Input
                      placeholder={t('degree')}
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={t('field')}
                      value={edu.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                      disabled={isLoading}
                    />
                    <Input
                      placeholder={t('graduationYear')}
                      value={edu.graduationYear}
                      onChange={(e) =>
                        updateEducation(index, 'graduationYear', e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}

              {data.education.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  No education added yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Startup context ───────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Idea Stage */}
            <div className="space-y-2">
              <Label>{t('ideaStage')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {IDEA_STAGES.map((stage) => {
                  const Icon = stage.icon;
                  const isSelected = data.ideaStage === stage.value;
                  return (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => updateData('ideaStage', stage.value)}
                      className={cn(
                        'flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      )}
                      disabled={isLoading}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-sm font-medium">
                        {tStages(stage.value)}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {stage.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Industry Interests */}
            <div className="space-y-2">
              <Label>{t('industryInterests')}</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleArrayItem('industryInterests', industry)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      data.industryInterests.includes(industry)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                    disabled={isLoading}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Ecosystem Tags */}
            <div className="space-y-2">
              <Label>{t('ecosystemTags')}</Label>
              <div className="flex flex-wrap gap-2">
                {ECOSYSTEM_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleArrayItem('ecosystemTags', tag)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      data.ecosystemTags.includes(tag)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                    disabled={isLoading}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio — always visible; this saves to the profile bio column */}
            <div className="space-y-2">
              <Label htmlFor="ideaDescription">
                {data.ideaStage && data.ideaStage !== 'no_idea'
                  ? 'About You & Your Idea'
                  : 'About You'}
              </Label>
              <p className="text-xs text-muted-foreground -mt-1">
                This appears as your bio on your public profile.
              </p>
              <Textarea
                id="ideaDescription"
                value={data.ideaDescription}
                onChange={(e) => updateData('ideaDescription', e.target.value)}
                placeholder={
                  data.ideaStage && data.ideaStage !== 'no_idea'
                    ? 'Tell us about yourself and briefly describe your startup idea...'
                    : 'Tell us about yourself, your background, and what you\'re looking to build...'
                }
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* ── Step 4: What you're looking for ───────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Co-founder Roles Desired */}
            <div className="space-y-2">
              <Label>{t('cofounderRoles')}</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleArrayItem('cofounderRoles', role)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      data.cofounderRoles.includes(role)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                    disabled={isLoading}
                  >
                    {tRoles(role as 'technical' | 'business' | 'design' | 'product' | 'operations')}
                  </button>
                ))}
              </div>
            </div>

            {/* Ideal Co-founder Description */}
            <div className="space-y-2">
              <Label htmlFor="idealCofounder">
                {t('idealCofounder')}{' '}
                <span className="text-xs text-muted-foreground">
                  ({data.idealCofounder.length}/300)
                </span>
              </Label>
              <Textarea
                id="idealCofounder"
                value={data.idealCofounder}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    updateData('idealCofounder', e.target.value);
                  }
                }}
                placeholder="Describe your ideal co-founder..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Equity Range */}
            <div className="space-y-2">
              <Label>{t('equityRange')}</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-muted-foreground">Min %</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={data.equityMin}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      updateData('equityMin', val);
                    }}
                    disabled={isLoading}
                  />
                </div>
                <span className="mt-5 text-muted-foreground">-</span>
                <div className="flex-1 space-y-1">
                  <span className="text-xs text-muted-foreground">Max %</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={data.equityMax}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      updateData('equityMax', val);
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Search Stage */}
            <div className="space-y-2">
              <Label>{t('searchStage')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {SEARCH_STAGES.map((stage) => {
                  const Icon = stage.icon;
                  const isSelected = data.searchStage === stage.value;
                  return (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => updateData('searchStage', stage.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      )}
                      disabled={isLoading}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-xs font-medium">{stage.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Preferences & contact ─────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            {/* Commitment Level */}
            <div className="space-y-2">
              <Label>{t('commitment')}</Label>
              <div className="space-y-2">
                {COMMITMENT_LEVELS.map((level) => {
                  const isSelected = data.commitment === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateData('commitment', level.value)}
                      className={cn(
                        'flex w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      )}
                      disabled={isLoading}
                    >
                      <span className="text-sm font-medium">{level.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {level.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages Spoken */}
            <div className="space-y-2">
              <Label>{t('languagesSpoken')}</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleArrayItem('languages', lang)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      data.languages.includes(lang)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                    disabled={isLoading}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Telegram Handle */}
            <div className="space-y-2">
              <Label htmlFor="telegramHandle">{t('telegramHandle')}</Label>
              <Input
                id="telegramHandle"
                value={data.telegramHandle}
                onChange={(e) => updateData('telegramHandle', e.target.value)}
                placeholder="@username"
                disabled={isLoading}
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">{t('linkedinUrl')}</Label>
              <Input
                id="linkedinUrl"
                value={data.linkedinUrl}
                onChange={(e) => updateData('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                disabled={isLoading}
              />
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3">
              <Label>Notifications</Label>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{t('emailNotifications')}</p>
                  <p className="text-xs text-muted-foreground">
                    Receive match and message updates via email
                  </p>
                </div>
                <Switch
                  checked={data.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateData('emailNotifications', checked)
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{t('telegramNotifications')}</p>
                  <p className="text-xs text-muted-foreground">
                    Get instant notifications on Telegram
                  </p>
                </div>
                <Switch
                  checked={data.telegramNotifications}
                  onCheckedChange={(checked) =>
                    updateData('telegramNotifications', checked)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1 || isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : step === TOTAL_STEPS ? (
            t('finish')
          ) : (
            <>
              {t('next')}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
