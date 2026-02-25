import crypto from 'crypto'

interface TelegramMessage {
  chatId: number
  text: string
  parseMode?: 'HTML' | 'Markdown'
}

export async function sendTelegramMessage({ chatId, text, parseMode = 'HTML' }: TelegramMessage) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not set')
    return false
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
    return false
  }
}

export function buildConnectionRequestMessage(fromName: string, appUrl: string): string {
  return `<b>New Connection Request</b>\n\n<b>${fromName}</b> wants to connect with you on CoFound Central Asia!\n\n<a href="${appUrl}/notifications">View Request</a>`
}

export function buildConnectionAcceptedMessage(fromName: string, appUrl: string): string {
  return `<b>Connection Accepted</b>\n\n<b>${fromName}</b> accepted your connection request!\n\n<a href="${appUrl}/messages">Start Chatting</a>`
}

export function buildNewMessageMessage(fromName: string, appUrl: string, threadId: string): string {
  return `<b>New Message</b>\n\nYou have a new message from <b>${fromName}</b>\n\n<a href="${appUrl}/messages/${threadId}">Open Chat</a>`
}

export function buildIdeaInterestMessage(fromName: string, ideaTitle: string, appUrl: string, ideaId: string): string {
  return `<b>Someone is interested in your idea!</b>\n\n<b>${fromName}</b> expressed interest in "<b>${ideaTitle}</b>"\n\n<a href="${appUrl}/ideas/${ideaId}">View Idea</a>`
}

// Verify Telegram login widget hash
export function verifyTelegramAuth(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...rest } = data
  if (!hash) return false

  const checkString = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

  return hmac === hash
}
