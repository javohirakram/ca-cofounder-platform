/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = session.user.id;
  // requesterId: used by notifications (find by requester+recipient)
  // connectionId: used by connections page (find directly by row ID)
  const { requesterId, connectionId, action } = await request.json();

  if ((!requesterId && !connectionId) || !['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const db = createAdminClient() as any;

  if (action === 'accept') {
    let resolvedRequesterId = requesterId;

    if (connectionId) {
      // Fetch the connection to verify recipient and get requester
      const { data: connRow } = await db
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('id', connectionId)
        .eq('recipient_id', currentUserId)
        .maybeSingle();

      if (!connRow) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
      }
      resolvedRequesterId = (connRow as { requester_id: string }).requester_id;

      const { error: connError } = await db
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (connError) {
        return NextResponse.json({ error: connError.message }, { status: 500 });
      }
    } else {
      const { error: connError } = await db
        .from('connections')
        .update({ status: 'accepted' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending');

      if (connError) {
        return NextResponse.json({ error: connError.message }, { status: 500 });
      }
    }

    // Create a message thread (ignore duplicate)
    const { error: threadError } = await db.from('threads').insert({
      participant_a: currentUserId,
      participant_b: resolvedRequesterId,
    });

    if (threadError && !threadError.message.includes('duplicate')) {
      console.error('Thread creation error:', threadError);
    }

    // Get current user's name for the notification
    const { data: myProfile } = await db
      .from('profiles')
      .select('full_name')
      .eq('id', currentUserId)
      .maybeSingle();

    const myName = (myProfile as { full_name: string | null } | null)?.full_name ?? 'Someone';

    // Notify the requester
    await db.from('notifications').insert({
      user_id: resolvedRequesterId,
      type: 'connection_accepted',
      title: `${myName} accepted your connection request`,
      body: 'You can now message each other.',
      link: `/profile/${currentUserId}`,
    });

    return NextResponse.json({ success: true });
  } else {
    // Decline
    if (connectionId) {
      const { error } = await db
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .eq('recipient_id', currentUserId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await db
        .from('connections')
        .update({ status: 'declined' })
        .eq('requester_id', requesterId)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }
}
