// app/actions/leaderboard.ts
'use server'

import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createHash } from 'crypto'

// Validation schemas
const ScoreSubmissionSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(30, 'Name cannot exceed 30 characters')
    .trim()
    .regex(
      /^[a-zA-Z0-9_\- ]+$/,
      'Only letters, numbers, spaces, and - _ allowed'
    ),
  score: z.number().nonnegative('Score must be 0 or positive'),
  level: z.number().positive('Level must be positive'),
  lines: z.number().nonnegative('Lines must be 0 or positive'),
  clientData: z.object({
    gameTime: z.number().nonnegative(),
    moves: z.number().nonnegative(),
    lineClears: z.array(z.number()),
    powerUpsUsed: z.array(z.string())
  })
})

type ScoreSubmission = z.infer<typeof ScoreSubmissionSchema>

// Types
interface LeaderboardEntry extends ScoreSubmission {
  id: string
  timestamp: number
  verificationHash: string
  rank?: number
}

interface RecentName {
  name: string
  submissions: number
  lastSubmission: number
  ipAddress: string
}

// Constants
const redis = Redis.fromEnv()
const LEADERBOARD_KEY = 'block-blitz-leaderboard'
const RECENT_NAMES_KEY = 'block-blitz-recent-names'
const SCORE_SECRET = process.env.SCORE_SECRET || 'default-secret-change-me'
const LEADERBOARD_LIMIT = 100
const NAME_COOLDOWN = 24 * 60 * 60 * 1000 // 24 hours
const MAX_SUBMISSIONS_PER_NAME = 3
const RATE_LIMIT = {
  WINDOW_MS: 3600000, // 1 hour
  MAX_SUBMISSIONS: 5
}

// Score verification helper
function generateScoreHash(data: {
  score: number
  level: number
  lines: number
  timestamp: number
  gameTime: number
  secret: string
}): string {
  return createHash('sha256')
    .update(
      `${data.score}-${data.level}-${data.lines}-${data.timestamp}-${data.gameTime}-${data.secret}`
    )
    .digest('hex')
}

// Score validation helper
function verifyScore(submission: ScoreSubmission): boolean {
  // Basic validation checks
  if (submission.clientData.gameTime <= 0 || submission.clientData.moves <= 0) {
    return false
  }

  // Verify score matches level and lines
  const expectedMinLines = (submission.level - 1) * 10
  if (submission.lines < expectedMinLines) {
    return false
  }

  // Verify average score per line is reasonable
  const averageScorePerLine = submission.score / Math.max(submission.lines, 1)
  if (averageScorePerLine > 1000) {
    return false
  }

  // Verify game time is reasonable
  const minTimePerLine = 2 // seconds
  const expectedMinTime = submission.lines * minTimePerLine
  if (submission.clientData.gameTime < expectedMinTime) {
    return false
  }

  // Verify moves are reasonable
  const minMovesPerLine = 4
  const expectedMinMoves = submission.lines * minMovesPerLine
  if (submission.clientData.moves < expectedMinMoves) {
    return false
  }

  return true
}

// Rate limiting helper
async function checkRateLimit(ip: string): Promise<{
  allowed: boolean
  remaining: number
  resetIn?: number
}> {
  const key = `rate-limit:${ip}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.WINDOW_MS

  // Clean up old entries
  await redis.zremrangebyscore(key, 0, windowStart)

  // Get current count
  const count = await redis.zcard(key)

  if (count >= RATE_LIMIT.MAX_SUBMISSIONS) {
    // Get reset time
    const oldestEntry = await redis.zrange(key, 0, 0)
    const resetIn = oldestEntry
      ? parseInt(oldestEntry[0] as string) + RATE_LIMIT.WINDOW_MS - now
      : 0

    return {
      allowed: false,
      remaining: 0,
      resetIn
    }
  }

  // Add new submission timestamp
  await redis.zadd(key, { score: now, member: now.toString() })
  await redis.expire(key, Math.ceil(RATE_LIMIT.WINDOW_MS / 1000))

  return {
    allowed: true,
    remaining: RATE_LIMIT.MAX_SUBMISSIONS - (count + 1)
  }
}

// Name validation helper
async function checkRecentName(
  name: string,
  ipAddress: string
): Promise<{ allowed: boolean; error?: string; cooldownRemaining?: number }> {
  const normalizedName = name.toLowerCase().trim()
  const now = Date.now()

  try {
    // Get all recent names
    const recentNames = (await redis.get<RecentName[]>(RECENT_NAMES_KEY)) || []

    // Find existing name entry
    const existingEntry = recentNames.find(
      entry => entry.name === normalizedName
    )

    if (existingEntry) {
      // Check if it's the same IP
      if (existingEntry.ipAddress !== ipAddress) {
        return {
          allowed: false,
          error: 'This name is already taken by another player'
        }
      }

      // Check submission count within cooldown period
      if (now - existingEntry.lastSubmission < NAME_COOLDOWN) {
        if (existingEntry.submissions >= MAX_SUBMISSIONS_PER_NAME) {
          const cooldownRemaining =
            NAME_COOLDOWN - (now - existingEntry.lastSubmission)
          const hoursRemaining = Math.ceil(cooldownRemaining / (1000 * 60 * 60))
          return {
            allowed: false,
            error: `Daily limit reached for this name. Please try again in ${hoursRemaining} hour${
              hoursRemaining === 1 ? '' : 's'
            }`,
            cooldownRemaining
          }
        }

        // Update submission count
        existingEntry.submissions += 1
        existingEntry.lastSubmission = now
      } else {
        // Reset submissions after cooldown
        existingEntry.submissions = 1
        existingEntry.lastSubmission = now
      }
    } else {
      // Add new name entry
      recentNames.push({
        name: normalizedName,
        submissions: 1,
        lastSubmission: now,
        ipAddress
      })
    }

    // Clean up old entries
    const updatedNames = recentNames.filter(
      entry => now - entry.lastSubmission < NAME_COOLDOWN
    )

    // Save updated names
    await redis.set(RECENT_NAMES_KEY, updatedNames)

    return { allowed: true }
  } catch (error) {
    console.error('Error checking recent names:', error)
    return { allowed: true } // Allow on error to prevent blocking legitimate submissions
  }
}

// Server actions
export async function submitScore(
  submission: ScoreSubmission
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate submission data
    const validatedData = ScoreSubmissionSchema.parse(submission)

    // Get IP for validation
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] || 'unknown'

    // Check rate limit
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.allowed) {
      const minutesRemaining = Math.ceil((rateLimit.resetIn || 0) / 60000)
      return {
        success: false,
        error: `Too many attempts. Please try again in ${minutesRemaining} minute${
          minutesRemaining === 1 ? '' : 's'
        }`
      }
    }

    // Check name availability
    const nameCheck = await checkRecentName(validatedData.name, ip)
    if (!nameCheck.allowed) {
      return {
        success: false,
        error: nameCheck.error
      }
    }

    // Verify score legitimacy
    if (!verifyScore(validatedData)) {
      return { success: false, error: 'Invalid score submission detected' }
    }

    // Create entry with verification hash
    const timestamp = Date.now()
    const verificationHash = generateScoreHash({
      score: validatedData.score,
      level: validatedData.level,
      lines: validatedData.lines,
      timestamp,
      gameTime: validatedData.clientData.gameTime,
      secret: SCORE_SECRET
    })

    const entry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      ...validatedData,
      timestamp,
      verificationHash
    }

    // Store entry
    await redis.zadd(LEADERBOARD_KEY, {
      score: entry.score,
      member: JSON.stringify(entry)
    })

    // Keep only top scores
    await redis.zremrangebyrank(LEADERBOARD_KEY, 0, -LEADERBOARD_LIMIT - 1)

    return { success: true }
  } catch (error) {
    console.error('Failed to submit score:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message || 'Invalid submission data'
      }
    }
    return { success: false, error: 'Failed to submit score' }
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const entries = await redis.zrange<(LeaderboardEntry | number)[]>(
      LEADERBOARD_KEY,
      0,
      LEADERBOARD_LIMIT - 1,
      {
        rev: true,
        withScores: true
      }
    )

    if (!entries || entries.length === 0) {
      return []
    }

    const leaderboard: LeaderboardEntry[] = []
    for (let i = 0; i < entries.length; i += 2) {
      const entry = entries[i]
      if (typeof entry === 'number' || !entry) continue

      try {
        const parsedEntry =
          typeof entry === 'string' ? JSON.parse(entry) : entry
        if (
          'id' in parsedEntry &&
          'name' in parsedEntry &&
          'score' in parsedEntry
        ) {
          leaderboard.push({
            ...parsedEntry,
            rank: Math.floor(i / 2) + 1
          })
        }
      } catch (e) {
        console.error('Failed to parse leaderboard entry:', e)
      }
    }

    return leaderboard
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    throw new Error('Failed to fetch leaderboard')
  }
}
