import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { verifyTelegramAuth } from '@/lib/telegram'
import { Profile, ProfileInsert } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = body

    // Validate required fields
    if (!id || !hash || !auth_date) {
      return NextResponse.json(
        { error: 'Missing required Telegram auth fields' },
        { status: 400 }
      )
    }

    // Verify the auth data came from Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      )
    }

    // Build the data object for hash verification (all values must be strings)
    const authData: Record<string, string> = {
      id: String(id),
      auth_date: String(auth_date),
      hash: String(hash),
    }
    if (first_name) authData.first_name = String(first_name)
    if (last_name) authData.last_name = String(last_name)
    if (username) authData.username = String(username)
    if (photo_url) authData.photo_url = String(photo_url)

    const isValid = verifyTelegramAuth(authData, botToken)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Telegram authentication' },
        { status: 401 }
      )
    }

    // Check if auth_date is not too old (allow up to 1 day)
    const authTimestamp = parseInt(String(auth_date), 10)
    const now = Math.floor(Date.now() / 1000)
    if (now - authTimestamp > 86400) {
      return NextResponse.json(
        { error: 'Telegram authentication expired' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const telegramId = Number(id)
    const fullName = [first_name, last_name].filter(Boolean).join(' ')
    const email = `telegram_${telegramId}@cofound.local`

    // Check if a profile with this telegram_id already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegramId)
      .single() as { data: Pick<Profile, 'id'> | null }

    if (existingProfile) {
      // User exists -- sign them in by generating a magic link or custom token
      // Use the admin client to get or create the auth user and generate a session
      const { data: authUser } = await supabase.auth.admin.getUserById(existingProfile.id)

      if (!authUser?.user) {
        return NextResponse.json(
          { error: 'Auth user not found for existing profile' },
          { status: 500 }
        )
      }

      // Generate a magic link for the user (acts as a sign-in mechanism)
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: authUser.user.email || email,
      })

      if (linkError || !linkData) {
        return NextResponse.json(
          { error: 'Failed to generate sign-in link' },
          { status: 500 }
        )
      }

      // Update last_active on the profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', existingProfile.id)

      return NextResponse.json({
        success: true,
        isNewUser: false,
        redirectUrl: '/discover',
        // Return the hashed token properties for client-side session verification
        token_hash: linkData.properties?.hashed_token,
        verification_type: 'magiclink',
      })
    }

    // New user -- create auth user and profile
    const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: photo_url || null,
        telegram_id: telegramId,
        telegram_username: username || null,
      },
    })

    if (createError || !newAuthUser?.user) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create the profile row
    const profileData: ProfileInsert = {
      id: newAuthUser.user.id,
      full_name: fullName || null,
      avatar_url: photo_url || null,
      telegram_id: telegramId,
      telegram_handle: username ? `@${username}` : null,
      role: [],
      skills: [],
      industries: [],
      languages: [],
      looking_for_roles: [],
      ecosystem_tags: [],
      education: [],
      experience: [],
      is_actively_looking: true,
      is_admin: false,
      profile_completeness: 10,
      last_active: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      // Attempt to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(newAuthUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Generate sign-in link for the new user
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: 'User created but failed to generate sign-in link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isNewUser: true,
      redirectUrl: '/onboarding',
      token_hash: linkData.properties?.hashed_token,
      verification_type: 'magiclink',
    })
  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
