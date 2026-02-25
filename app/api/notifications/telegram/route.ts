import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import {
  sendTelegramMessage,
  buildConnectionRequestMessage,
  buildConnectionAcceptedMessage,
  buildNewMessageMessage,
  buildIdeaInterestMessage,
} from '@/lib/telegram'

type NotificationType = 'connection_request' | 'connection_accepted' | 'new_message' | 'idea_interest'

interface NotificationBody {
  userId: string
  type: NotificationType
  fromName: string
  threadId?: string
  ideaId?: string
  ideaTitle?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationBody = await request.json()
    const { userId, type, fromName, threadId, ideaId, ideaTitle } = body

    // Validate required fields
    if (!userId || !type || !fromName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, fromName' },
        { status: 400 }
      )
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'connection_request',
      'connection_accepted',
      'new_message',
      'idea_interest',
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch the target user's profile to get their telegram_id
    const supabase = createAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_id, full_name')
      .eq('id', userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single() as { data: { telegram_id: number | null; full_name: string | null } | null; error: any }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (!profile.telegram_id) {
      return NextResponse.json({
        success: false,
        reason: 'User does not have a Telegram account linked',
      })
    }

    // Build the appropriate message based on type
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cofound.centralasia.com'
    let message: string

    switch (type) {
      case 'connection_request':
        message = buildConnectionRequestMessage(fromName, appUrl)
        break

      case 'connection_accepted':
        message = buildConnectionAcceptedMessage(fromName, appUrl)
        break

      case 'new_message':
        if (!threadId) {
          return NextResponse.json(
            { error: 'threadId is required for new_message notifications' },
            { status: 400 }
          )
        }
        message = buildNewMessageMessage(fromName, appUrl, threadId)
        break

      case 'idea_interest':
        if (!ideaId || !ideaTitle) {
          return NextResponse.json(
            { error: 'ideaId and ideaTitle are required for idea_interest notifications' },
            { status: 400 }
          )
        }
        message = buildIdeaInterestMessage(fromName, ideaTitle, appUrl, ideaId)
        break

      default:
        return NextResponse.json(
          { error: 'Unhandled notification type' },
          { status: 400 }
        )
    }

    // Send the Telegram message
    const sent = await sendTelegramMessage({
      chatId: profile.telegram_id,
      text: message,
      parseMode: 'HTML',
    })

    if (!sent) {
      return NextResponse.json(
        { success: false, reason: 'Failed to send Telegram message' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
