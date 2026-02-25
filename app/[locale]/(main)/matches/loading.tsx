import { Skeleton } from '@/components/ui/skeleton';

export default function MatchesLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Refresh row skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-9 w-56 rounded-lg" />

      {/* Match cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 flex items-center gap-6"
          >
            {/* Left: avatar + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Center: skills */}
            <div className="hidden md:flex flex-wrap gap-1.5 flex-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* Right: score circle */}
            <div className="shrink-0">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
