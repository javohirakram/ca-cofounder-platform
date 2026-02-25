'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
  url: string | null;
  userId: string;
  userName?: string;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ url, userId, userName, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('onboarding');

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      setProgress(70);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProgress(90);

      const publicUrl = publicUrlData.publicUrl;

      // Update profile avatar_url
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as never)
        .eq('id', userId);

      setProgress(100);
      onUpload(publicUrl);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'group relative rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transition-opacity',
          uploading && 'opacity-70 cursor-not-allowed'
        )}
        aria-label={t('profilePhoto')}
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={url ?? undefined} alt={userName ?? 'Avatar'} />
          <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
            {userName ? getInitials(userName) : '?'}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center rounded-full',
          'bg-black/0 group-hover:bg-black/40 transition-colors',
          uploading && 'bg-black/40'
        )}>
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </button>

      {/* Progress bar */}
      {uploading && (
        <div className="w-24">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive text-center max-w-48">
          {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {t('profilePhoto')}
      </p>
    </div>
  );
}
