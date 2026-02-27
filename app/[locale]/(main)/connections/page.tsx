'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Users, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInitials, cn } from '@/lib/utils';
import type { Connection, Profile } from '@/types/database';

interface ConnectionWithProfile {
  connection: Connection;
  profile: Profile;
  direction: 'incoming' | 'outgoing';
}

export default function ConnectionsPage() {
  const t = useTranslations('connections');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [pending, setPending] = useState<ConnectionWithProfile[]>([]);
  const [accepted, setAccepted] = useState<ConnectionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push(`/${locale}/login`);
        return;
      }

      const userId = session.user.id;

      // Fetch all connections involving current user
      const { data: connections, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allConnections = (connections as Connection[]) ?? [];

      // Gather all other user IDs
      const otherIds = allConnections.map((c) =>
        c.requester_id === userId ? c.recipient_id : c.requester_id
      );

      if (otherIds.length === 0) {
        setPending([]);
        setAccepted([]);
        return;
      }

      // Fetch their profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', otherIds);

      const profileMap: Record<string, Profile> = {};
      if (profiles) {
        for (const p of profiles as Profile[]) {
          profileMap[p.id] = p;
        }
      }

      const enriched: ConnectionWithProfile[] = allConnections
        .map((c) => {
          const otherId = c.requester_id === userId ? c.recipient_id : c.requester_id;
          const profile = profileMap[otherId];
          if (!profile) return null;
          return {
            connection: c,
            profile,
            direction: c.requester_id === userId ? 'outgoing' : 'incoming',
          } as ConnectionWithProfile;
        })
        .filter((c): c is ConnectionWithProfile => c !== null);

      setPending(enriched.filter((c) => c.connection.status === 'pending'));
      setAccepted(enriched.filter((c) => c.connection.status === 'accepted'));
    } catch {
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  }, [locale, router]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  async function handleAccept(connectionId: string) {
    setActionLoading(connectionId + '-accept');
    try {
      const res = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action: 'accept' }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to accept');
      }

      // Move from pending to accepted
      setPending((prev) => prev.filter((c) => c.connection.id !== connectionId));
      setAccepted((prev) => {
        const item = pending.find((c) => c.connection.id === connectionId);
        if (!item) return prev;
        return [{ ...item, connection: { ...item.connection, status: 'accepted' } }, ...prev];
      });

      toast.success('Connection accepted!');
    } catch {
      toast.error('Failed to accept connection');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(connectionId: string) {
    setActionLoading(connectionId + '-decline');
    try {
      const res = await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action: 'decline' }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to decline');
      }

      setPending((prev) => prev.filter((c) => c.connection.id !== connectionId));
      toast.success('Connection request declined');
    } catch {
      toast.error('Failed to decline connection');
    } finally {
      setActionLoading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const incomingPending = pending.filter((c) => c.direction === 'incoming');
  const outgoingPending = pending.filter((c) => c.direction === 'outgoing');

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} />

      {/* Incoming Pending Requests */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          {t('pendingRequests')}
          {incomingPending.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {incomingPending.length}
            </Badge>
          )}
        </h2>

        {incomingPending.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-8 w-8" />}
            title={t('noPendingRequests')}
            description={t('noPendingRequestsDesc')}
          />
        ) : (
          <div className="space-y-3">
            {incomingPending.map(({ connection, profile }) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                profile={profile}
                locale={locale}
                direction="incoming"
                actionLoading={actionLoading}
                onAccept={handleAccept}
                onDecline={handleDecline}
                acceptLabel={t('accept')}
                declineLabel={t('decline')}
                acceptingLabel={t('accepting')}
                decliningLabel={t('declining')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Accepted Connections */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {t('myConnections')}
          {accepted.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {accepted.length}
            </Badge>
          )}
        </h2>

        {accepted.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title={t('noConnections')}
            description={t('noConnectionsDesc')}
          />
        ) : (
          <div className="space-y-3">
            {accepted.map(({ connection, profile }) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                profile={profile}
                locale={locale}
                direction="accepted"
                actionLoading={actionLoading}
                onAccept={handleAccept}
                onDecline={handleDecline}
                acceptLabel={t('accept')}
                declineLabel={t('decline')}
                acceptingLabel={t('accepting')}
                decliningLabel={t('declining')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Outgoing pending (sent by current user) */}
      {outgoingPending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Sent Requests
            <Badge variant="secondary" className="text-xs">
              {outgoingPending.length}
            </Badge>
          </h2>
          <div className="space-y-3">
            {outgoingPending.map(({ connection, profile }) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                profile={profile}
                locale={locale}
                direction="outgoing"
                actionLoading={actionLoading}
                onAccept={handleAccept}
                onDecline={handleDecline}
                acceptLabel={t('accept')}
                declineLabel={t('decline')}
                acceptingLabel={t('accepting')}
                decliningLabel={t('declining')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface ConnectionCardProps {
  connection: Connection;
  profile: Profile;
  locale: string;
  direction: 'incoming' | 'outgoing' | 'accepted';
  actionLoading: string | null;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  acceptLabel: string;
  declineLabel: string;
  acceptingLabel: string;
  decliningLabel: string;
}

function ConnectionCard({
  connection,
  profile,
  locale,
  direction,
  actionLoading,
  onAccept,
  onDecline,
  acceptLabel,
  declineLabel,
  acceptingLabel,
  decliningLabel,
}: ConnectionCardProps) {
  const isAccepting = actionLoading === connection.id + '-accept';
  const isDeclining = actionLoading === connection.id + '-decline';

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/20 transition-colors">
      <Link href={`/${locale}/profile/${profile.id}`}>
        <Avatar className="h-12 w-12 shrink-0 ring-2 ring-border/40 hover:ring-primary/30 transition-all">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ''} />
          <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
            {profile.full_name ? getInitials(profile.full_name) : '?'}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${locale}/profile/${profile.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
          >
            {profile.full_name}
          </Link>
          {direction === 'accepted' && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-400"
            >
              Connected
            </Badge>
          )}
          {direction === 'outgoing' && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-400"
            >
              Pending
            </Badge>
          )}
        </div>
        {profile.headline && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.headline}</p>
        )}
        {connection.message && direction === 'incoming' && (
          <p className={cn(
            'text-xs text-muted-foreground mt-2 line-clamp-2 rounded-md bg-muted/50 px-3 py-2 border border-border/40'
          )}>
            &ldquo;{connection.message}&rdquo;
          </p>
        )}
      </div>

      {direction === 'incoming' && (
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => onAccept(connection.id)}
            disabled={isAccepting || isDeclining}
          >
            {isAccepting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />{acceptingLabel}</>
            ) : (
              <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />{acceptLabel}</>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => onDecline(connection.id)}
            disabled={isAccepting || isDeclining}
          >
            {isDeclining ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />{decliningLabel}</>
            ) : (
              declineLabel
            )}
          </Button>
        </div>
      )}

      {direction === 'accepted' && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs shrink-0"
          asChild
        >
          <Link href={`/${locale}/profile/${profile.id}`}>
            View Profile
          </Link>
        </Button>
      )}
    </div>
  );
}
