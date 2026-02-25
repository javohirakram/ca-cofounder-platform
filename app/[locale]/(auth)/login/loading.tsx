import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="mx-auto h-4 w-60" />
      </div>

      {/* Form fields skeleton */}
      <div className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Skeleton className="h-px w-full" />
        </div>
        <div className="relative flex justify-center">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Telegram button */}
      <Skeleton className="h-10 w-full" />

      {/* Register link */}
      <Skeleton className="mx-auto h-4 w-48" />
    </div>
  );
}
