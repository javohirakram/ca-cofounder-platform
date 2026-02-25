import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminReportsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-52" />
      </div>

      {/* Coming soon placeholder */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="mt-4 h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-80" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      {/* Planned features */}
      <div>
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 p-5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
