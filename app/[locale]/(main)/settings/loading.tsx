import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header skeleton */}
      <Skeleton className="h-8 w-32" />

      {/* Account card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-16 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>

      {/* Profile card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Notifications card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        ))}
      </div>

      {/* Appearance card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Language card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Privacy card skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      </div>

      {/* Danger zone card skeleton */}
      <div className="rounded-xl border border-destructive/50 bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
}
