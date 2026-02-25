import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Layout: sidebar + grid */}
      <div className="flex gap-6">
        {/* Sidebar skeleton (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-px w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-6" />
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    </div>
  );
}
