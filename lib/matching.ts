import { Profile } from '@/types/database'

interface ScoreBreakdown {
  roles: number
  industry: number
  commitment: number
  stage: number
  location: number
  languages: number
}

interface MatchResult {
  score: number
  breakdown: ScoreBreakdown
}

const NEIGHBORING_COUNTRIES: Record<string, string[]> = {
  'Kazakhstan': ['Kyrgyzstan', 'Uzbekistan', 'Turkmenistan'],
  'Kyrgyzstan': ['Kazakhstan', 'Uzbekistan', 'Tajikistan'],
  'Uzbekistan': ['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan'],
  'Tajikistan': ['Kyrgyzstan', 'Uzbekistan'],
  'Turkmenistan': ['Kazakhstan', 'Uzbekistan'],
}

export function calculateMatchScore(userA: Profile, userB: Profile): MatchResult {
  const breakdown: ScoreBreakdown = {
    roles: calculateRoleScore(userA, userB),
    industry: calculateIndustryScore(userA, userB),
    commitment: calculateCommitmentScore(userA, userB),
    stage: calculateStageScore(userA, userB),
    location: calculateLocationScore(userA, userB),
    languages: calculateLanguageScore(userA, userB),
  }

  return {
    score: Object.values(breakdown).reduce((a, b) => a + b, 0),
    breakdown,
  }
}

// Complementary roles (30 pts): technical<->business = 30, technical<->product = 20, technical<->design = 20, same role = 5
function calculateRoleScore(a: Profile, b: Profile): number {
  const rolesA = a.role || []
  const rolesB = b.role || []
  if (!rolesA.length || !rolesB.length) return 0

  let maxScore = 0
  const complementaryPairs: Record<string, Record<string, number>> = {
    'technical': { 'business': 30, 'product': 20, 'design': 20, 'operations': 15, 'technical': 5 },
    'business': { 'technical': 30, 'product': 15, 'design': 15, 'operations': 10, 'business': 5 },
    'design': { 'technical': 20, 'business': 15, 'product': 15, 'operations': 10, 'design': 5 },
    'product': { 'technical': 20, 'business': 15, 'design': 15, 'operations': 10, 'product': 5 },
    'operations': { 'technical': 15, 'business': 10, 'design': 10, 'product': 10, 'operations': 5 },
  }

  for (const rA of rolesA) {
    for (const rB of rolesB) {
      const score = complementaryPairs[rA]?.[rB] || 0
      maxScore = Math.max(maxScore, score)
    }
  }
  return maxScore
}

// Industry overlap (20 pts)
function calculateIndustryScore(a: Profile, b: Profile): number {
  const indA = new Set(a.industries || [])
  const indB = new Set(b.industries || [])
  if (!indA.size || !indB.size) return 0
  const shared = Array.from(indA).filter(x => indB.has(x)).length
  const total = new Set(Array.from(indA).concat(Array.from(indB))).size
  return Math.round((shared / total) * 20)
}

// Commitment (20 pts)
function calculateCommitmentScore(a: Profile, b: Profile): number {
  if (!a.commitment || !b.commitment) return 0
  if (a.commitment === b.commitment) return 20
  if (a.commitment === 'exploring' || b.commitment === 'exploring') return 5
  // one full_time, one part_time
  return 10
}

// Stage (10 pts)
function calculateStageScore(a: Profile, b: Profile): number {
  if (!a.idea_stage || !b.idea_stage) return 0
  const stages = ['no_idea', 'have_idea', 'side_project', 'early_traction']
  const idxA = stages.indexOf(a.idea_stage)
  const idxB = stages.indexOf(b.idea_stage)
  if (idxA === -1 || idxB === -1) return 0
  const diff = Math.abs(idxA - idxB)
  if (diff === 0) return 10
  if (diff === 1) return 5
  return 0
}

// Location (10 pts)
function calculateLocationScore(a: Profile, b: Profile): number {
  if (!a.country || !b.country) return 0
  if (a.city && b.city && a.city === b.city) return 10
  if (a.country === b.country) return 7
  if (NEIGHBORING_COUNTRIES[a.country]?.includes(b.country)) return 4
  return 0
}

// Languages (10 pts)
function calculateLanguageScore(a: Profile, b: Profile): number {
  const langA = new Set(a.languages || [])
  const langB = new Set(b.languages || [])
  if (!langA.size || !langB.size) return 0
  const shared = Array.from(langA).filter(x => langB.has(x)).length
  if (shared >= 2) return 10
  if (shared === 1) return 5
  return 0
}
