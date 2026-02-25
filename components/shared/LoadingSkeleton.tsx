import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'profile' | 'chat';
  count?: number;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-18 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-5 w-24 rounded-full" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md shrink-0" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Incoming message */}
      <div className="flex items-end gap-2">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-10 w-52 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Outgoing message */}
      <div className="flex items-end gap-2 justify-end">
        <div className="space-y-1 flex flex-col items-end">
          <Skeleton className="h-10 w-44 rounded-2xl rounded-br-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Incoming message */}
      <div className="flex items-end gap-2">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Outgoing message */}
      <div className="flex items-end gap-2 justify-end">
        <div className="space-y-1 flex flex-col items-end">
          <Skeleton className="h-10 w-56 rounded-2xl rounded-br-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Incoming message */}
      <div className="flex items-end gap-2">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-10 w-40 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ variant, count = 6 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <ListSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return <ProfileSkeleton />;
  }

  if (variant === 'chat') {
    return <ChatSkeleton />;
  }

  return null;
}
