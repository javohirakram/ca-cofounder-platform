'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ConnectModal } from '@/components/discover/ConnectModal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Profile } from '@/types/database';

interface FounderGridProps {
  profiles: Profile[];
  total: number;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  currentUserId?: string | null;
  connectionStatuses?: Record<string, 'pending' | 'connected'>;
  onConnected?: (profileId: string) => void;
}

export function FounderGrid({ profiles, total, onLoadMore, hasMore, loading, currentUserId, connectionStatuses = {}, onConnected }: FounderGridProps) {
  const t = useTranslations('discover');
  const [connectProfile, setConnectProfile] = useState<Profile | null>(null);

  return (
    <div className="space-y-6">
      {/* Results count */}
      <p className="text-sm text-muted-foreground tabular-nums">
        {t('showingResults', { count: total })}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isOwnProfile={currentUserId === profile.id}
            connectionStatus={connectionStatuses[profile.id] ?? 'none'}
            onConnect={(p) => setConnectProfile(p)}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="min-w-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loadMore')}
              </>
            ) : (
              t('loadMore')
            )}
          </Button>
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal
        profile={connectProfile}
        open={connectProfile !== null}
        onOpenChange={(open) => {
          if (!open) setConnectProfile(null);
        }}
        onSuccess={(profileId) => {
          onConnected?.(profileId);
          setConnectProfile(null);
        }}
      />
    </div>
  );
}
