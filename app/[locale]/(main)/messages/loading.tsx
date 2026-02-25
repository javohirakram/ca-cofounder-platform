import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-7 w-28" />

      {/* Two-panel layout */}
      <div className="border rounded-xl overflow-hidden bg-card h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Thread list */}
          <div className="w-80 border-r">
            {/* Search */}
            <div className="p-3 border-b">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* Threads */}
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3">
              <div className="flex justify-start">
                <Skeleton className="h-10 w-48 rounded-2xl rounded-bl-sm" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40 rounded-2xl rounded-br-sm" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-14 w-56 rounded-2xl rounded-bl-sm" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-52 rounded-2xl rounded-br-sm" />
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
