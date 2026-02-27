import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

// GET /api/messages?threadId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('threadId');

  if (!threadId) {
    return NextResponse.json({ error: 'threadId required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Verify caller is a thread participant
  const { data: thread } = await admin
    .from('threads')
    .select('id')
    .eq('id', threadId)
    .or(`participant_a.eq.${session.user.id},participant_b.eq.${session.user.id}`)
    .maybeSingle();

  if (!thread) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: messages, error } = await admin
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark unread messages from others as read
  const unreadIds = (messages ?? [])
    .filter((m) => m.sender_id !== session.user.id && !m.is_read)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('messages') as any).update({ is_read: true }).in('id', unreadIds);
  }

  return NextResponse.json({ messages: messages ?? [] });
}

// POST /api/messages
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { threadId, content } = await request.json();

  if (!threadId || !content?.trim()) {
    return NextResponse.json({ error: 'threadId and content required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify caller is a thread participant
  const { data: thread } = await admin
    .from('threads')
    .select('id')
    .eq('id', threadId)
    .or(`participant_a.eq.${session.user.id},participant_b.eq.${session.user.id}`)
    .maybeSingle();

  if (!thread) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: message, error } = await (admin.from('messages') as any)
    .insert({
      thread_id: threadId,
      sender_id: session.user.id,
      content: content.trim(),
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update thread last_message_at
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('threads') as any)
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', threadId);

  return NextResponse.json({ message });
}
