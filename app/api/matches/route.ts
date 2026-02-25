import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { calculateMatchScore } from '@/lib/matching'
import { Profile, Match, Connection } from '@/types/database'

export async function GET() {
  try {
    // Authenticate the requesting user
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Get current user's profile
    const { data: currentProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single() as { data: Profile | null; error: any }

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found. Please complete onboarding first.' },
        { status: 404 }
      )
    }

    // Fetch all active profiles excluding current user
    const { data: candidates, error: candidatesError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('is_actively_looking', true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .neq('id', user.id) as { data: Profile[] | null; error: any }

    if (candidatesError) {
      return NextResponse.json(
        { error: 'Failed to fetch candidate profiles' },
        { status: 500 }
      )
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ matches: [], total: 0 })
    }

    // Get existing connections (accepted or pending) to exclude
    const { data: connections } = await adminClient
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`) as {
        data: Pick<Connection, 'requester_id' | 'recipient_id'>[] | null
      }

    const connectedUserIds = new Set<string>()
    if (connections) {
      for (const conn of connections) {
        if (conn.requester_id === user.id) {
          connectedUserIds.add(conn.recipient_id)
        } else {
          connectedUserIds.add(conn.requester_id)
        }
      }
    }

    // Get existing passed matches to exclude
    const { data: passedMatches } = await adminClient
      .from('matches')
      .select('user_a, user_b, status')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'passed') as {
        data: Pick<Match, 'user_a' | 'user_b' | 'status'>[] | null
      }

    const passedUserIds = new Set<string>()
    if (passedMatches) {
      for (const match of passedMatches) {
        if (match.user_a === user.id) {
          passedUserIds.add(match.user_b)
        } else {
          passedUserIds.add(match.user_a)
        }
      }
    }

    // Filter out connected and passed users, then score remaining candidates
    interface ScoredCandidate {
      profile: Profile
      score: number
      breakdown: { [key: string]: number }
    }

    const scoredCandidates: ScoredCandidate[] = []

    for (const candidate of candidates) {
      // Skip connected and passed users
      if (connectedUserIds.has(candidate.id) || passedUserIds.has(candidate.id)) {
        continue
      }

      const result = calculateMatchScore(currentProfile, candidate)
      scoredCandidates.push({
        profile: candidate,
        score: result.score,
        breakdown: { ...result.breakdown },
      })
    }

    // Sort by score descending and take top 20
    scoredCandidates.sort((a, b) => b.score - a.score)
    const topMatches = scoredCandidates.slice(0, 20)

    // Upsert match results into the matches table
    const now = new Date().toISOString()
    const upsertPromises = topMatches.map(async (match) => {
      // Ensure consistent ordering: user_a is always the smaller UUID
      const [userA, userB] = [user.id, match.profile.id].sort()

      await adminClient
        .from('matches')
        .upsert(
          {
            user_a: userA,
            user_b: userB,
            score: match.score,
            score_breakdown: match.breakdown,
            status: 'pending',
            last_computed_at: now,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          {
            onConflict: 'user_a,user_b',
            ignoreDuplicates: false,
          }
        )
    })

    await Promise.all(upsertPromises)

    // Return the matches with sanitized profile data (exclude sensitive fields)
    const responseMatches = topMatches.map((match) => ({
      userId: match.profile.id,
      fullName: match.profile.full_name,
      avatarUrl: match.profile.avatar_url,
      headline: match.profile.headline,
      bio: match.profile.bio,
      role: match.profile.role,
      skills: match.profile.skills,
      industries: match.profile.industries,
      country: match.profile.country,
      city: match.profile.city,
      languages: match.profile.languages,
      commitment: match.profile.commitment,
      ideaStage: match.profile.idea_stage,
      lookingForRoles: match.profile.looking_for_roles,
      lookingForDescription: match.profile.looking_for_description,
      ecosystemTags: match.profile.ecosystem_tags,
      score: match.score,
      breakdown: match.breakdown,
    }))

    return NextResponse.json({
      matches: responseMatches,
      total: responseMatches.length,
    })
  } catch (error) {
    console.error('Matches API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
