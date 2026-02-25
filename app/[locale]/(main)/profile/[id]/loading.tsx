import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <LoadingSkeleton variant="profile" />
    </div>
  );
}
