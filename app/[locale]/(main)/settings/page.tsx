'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Lock,
  Mail,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  Trash2,
  Loader2,
} from 'lucide-react';

// --- Schemas ---
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// --- Locale data ---
const locales = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'uz', label: "O'zbek", short: 'UZ' },
] as const;

// --- Component ---
export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { theme, setTheme } = useTheme();

  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hideProfile, setHideProfile] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [telegramNotifs, setTelegramNotifs] = useState(true);
  const [matchNotifs, setMatchNotifs] = useState(true);

  // --- Password form ---
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // --- Load user data ---
  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push(`/${locale}/login`);
        return;
      }

      setEmail(session.user.email ?? '');

      // Load profile for privacy toggle
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_actively_looking')
        .eq('id', session.user.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as { data: { is_actively_looking: boolean } | null, error: any };

      if (profile) {
        setHideProfile(!profile.is_actively_looking);
      }

      // Load notification preferences from localStorage
      const savedPrefs = localStorage.getItem('notification_prefs');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          setEmailNotifs(prefs.emailNotifs ?? true);
          setTelegramNotifs(prefs.telegramNotifs ?? true);
          setMatchNotifs(prefs.matchNotifs ?? true);
        } catch {
          // Use defaults
        }
      }
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setIsLoading(false);
    }
  }, [locale, router, tCommon]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // --- Email update ---
  async function handleEmailUpdate() {
    setEmailSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('emailUpdated'));
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setEmailSaving(false);
    }
  }

  // --- Password update ---
  async function onPasswordSubmit(data: PasswordFormData) {
    setPasswordSaving(true);
    try {
      const supabase = createClient();

      // Verify current password by attempting sign in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) return;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error(signInError.message);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('passwordUpdated'));
      resetPasswordForm();
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setPasswordSaving(false);
    }
  }

  // --- Privacy toggle ---
  async function handleHideProfileToggle(checked: boolean) {
    setHideProfile(checked);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('profiles') as any)
        .update({ is_actively_looking: !checked })
        .eq('id', session.user.id);

      if (error) throw error;

      toast.success(t('settingsSaved'));
    } catch {
      setHideProfile(!checked);
      toast.error(tCommon('error'));
    }
  }

  // --- Notification preferences ---
  function saveNotifPrefs(
    key: 'emailNotifs' | 'telegramNotifs' | 'matchNotifs',
    value: boolean
  ) {
    const setters: Record<string, (v: boolean) => void> = {
      emailNotifs: setEmailNotifs,
      telegramNotifs: setTelegramNotifs,
      matchNotifs: setMatchNotifs,
    };
    setters[key](value);

    const current = { emailNotifs, telegramNotifs, matchNotifs };
    const updated = { ...current, [key]: value };
    localStorage.setItem('notification_prefs', JSON.stringify(updated));

    toast.success(t('settingsSaved'));
  }

  // --- Language switch ---
  function switchLocale(newLocale: string) {
    const pathWithoutLocale = pathname.replace(/^\/(en|ru|uz)/, '');
    router.push(`/${newLocale}${pathWithoutLocale}`);
  }

  // --- Delete account ---
  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') {
      toast.error(t('deleteTypeMismatch'));
      return;
    }

    setDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      // Mark profile as deleted by updating fields
      await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('profiles') as any)
        .update({
          full_name: '[Deleted User]',
          avatar_url: null,
          headline: null,
          bio: null,
          is_actively_looking: false,
        })
        .eq('id', session.user.id);

      // Sign out
      await supabase.auth.signOut();

      toast.success(t('accountDeleted'));
      router.push(`/${locale}/login`);
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t('title')} />

      {/* ============ Account Section ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {t('account')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Email */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium">
              {t('changeEmail')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={emailSaving}
              />
              <Button
                onClick={handleEmailUpdate}
                disabled={emailSaving}
                size="sm"
                className="shrink-0"
              >
                {emailSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  tCommon('save')
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Change Password */}
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              {t('changePassword')}
            </Label>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs text-muted-foreground">
                  {t('currentPassword')}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  disabled={passwordSaving}
                  {...register('currentPassword')}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs text-muted-foreground">
                  {t('newPassword')}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={passwordSaving}
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmNewPassword" className="text-xs text-muted-foreground">
                  {t('confirmNewPassword')}
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={passwordSaving}
                  {...register('confirmNewPassword')}
                />
                {errors.confirmNewPassword && (
                  <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" size="sm" disabled={passwordSaving}>
              {passwordSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                tCommon('save')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ============ Profile Section ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('profile')}</CardTitle>
          <CardDescription>{t('editProfileDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/profile/edit`)}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {t('goToProfile')}
          </Button>
        </CardContent>
      </Card>

      {/* ============ Notifications Section ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            {t('notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">{t('emailNotifs')}</Label>
              <p className="text-xs text-muted-foreground">{t('emailNotifsDesc')}</p>
            </div>
            <Switch
              checked={emailNotifs}
              onCheckedChange={(checked) => saveNotifPrefs('emailNotifs', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">{t('telegramNotifs')}</Label>
              <p className="text-xs text-muted-foreground">{t('telegramNotifsDesc')}</p>
            </div>
            <Switch
              checked={telegramNotifs}
              onCheckedChange={(checked) => saveNotifPrefs('telegramNotifs', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">{t('matchNotifs')}</Label>
              <p className="text-xs text-muted-foreground">{t('matchNotifsDesc')}</p>
            </div>
            <Switch
              checked={matchNotifs}
              onCheckedChange={(checked) => saveNotifPrefs('matchNotifs', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ============ Appearance Section ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('appearance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-accent/50'
              )}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs font-medium">{t('lightMode')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-accent/50'
              )}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs font-medium">{t('darkMode')}</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                theme === 'system'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-accent/50'
              )}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs font-medium">{t('systemMode')}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ============ Language Section ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {locales.map(({ code, label, short }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 transition-all',
                  locale === code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-accent/50'
                )}
              >
                <span className="text-sm font-semibold">{short}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============ Privacy Section ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('privacy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">{t('hideProfile')}</Label>
              <p className="text-xs text-muted-foreground">{t('hideProfileDesc')}</p>
            </div>
            <Switch
              checked={hideProfile}
              onCheckedChange={handleHideProfileToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* ============ Danger Zone Section ============ */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {t('dangerZone')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {t('deleteAccount')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('deleteAccount')}</DialogTitle>
                <DialogDescription>{t('deleteConfirm')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Input
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder={t('deleteConfirmPlaceholder')}
                  disabled={deleting}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteInput('');
                  }}
                  disabled={deleting}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteInput !== 'DELETE'}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    tCommon('confirm')
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
