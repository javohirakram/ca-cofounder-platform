'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import TelegramLoginButton from '@/components/telegram-login-button';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.acceptTerms === true, {
    message: 'You must accept the terms and conditions',
    path: ['acceptTerms'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // If email confirmation is required, the session will be null
      if (signUpData.session) {
        toast.success('Account created successfully!');
        router.push(`/${locale}/onboarding`);
      } else if (signUpData.user && !signUpData.session) {
        // Email confirmation is enabled — sign in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInError) {
          // Confirmation probably required — tell user to check email
          toast.success('Account created! Please check your email to confirm, then log in.');
          router.push(`/${locale}/login`);
        } else {
          toast.success('Account created successfully!');
          router.push(`/${locale}/onboarding`);
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">{t('registerTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('registerSubtitle')}</p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            disabled={isLoading}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onCheckedChange={(checked) => {
              setValue('acceptTerms', checked === true, { shouldValidate: true });
            }}
            disabled={isLoading}
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
          >
            I agree to the{' '}
            <Link
              href={`/${locale}/terms`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href={`/${locale}/privacy`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('registerButton')}...</span>
            </>
          ) : (
            t('registerButton')
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      {/* Telegram Register */}
      <TelegramLoginButton label="Sign up with Telegram" />

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href={`/${locale}/login`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
