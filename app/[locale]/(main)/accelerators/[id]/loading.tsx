import { Skeleton } from '@/components/ui/skeleton';

export default function AcceleratorDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back */}
      <Skeleton className="h-4 w-16" />

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More members */}
      <Skeleton className="h-px w-full" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
