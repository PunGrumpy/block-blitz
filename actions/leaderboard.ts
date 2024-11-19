'use server'

import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createHash } from 'crypto'

// Schema for score validation
const ScoreSubmissionSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  score: z.number().positive(),
  level: z.number().positive(),
  lines: z.number().nonnegative(),
  clientData: z.object({
    gameTime: z.number().positive(),
    moves: z.number().positive(),
    lineClears: z.array(z.number()),
    powerUpsUsed: z.array(z.string())
  })
})

type ScoreSubmission = z.infer<typeof ScoreSubmissionSchema>

interface LeaderboardEntry extends ScoreSubmission {
  id: string
  timestamp: number
  verificationHash: string
  rank?: number
}

// Redis setup
const redis = Redis.fromEnv()
const LEADERBOARD_KEY = 'block-blitz-leaderboard'
const LEADERBOARD_LIMIT = 100
const SCORE_SECRET = process.env.SCORE_SECRET || 'default-secret-change-me'

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 3600000, // 1 hour
  MAX_SUBMISSIONS: 5
}

// Score verification helpers
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

  // Verify average score per line is within reasonable limits
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
}> {
  const key = `rate-limit:${ip}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.WINDOW_MS

  // Clean up old entries
  await redis.zremrangebyscore(key, 0, windowStart)

  // Get current count
  const count = await redis.zcard(key)

  if (count >= RATE_LIMIT.MAX_SUBMISSIONS) {
    return { allowed: false, remaining: 0 }
  }

  // Add new submission timestamp
  await redis.zadd(key, { score: now, member: now.toString() })
  await redis.expire(key, Math.ceil(RATE_LIMIT.WINDOW_MS / 1000))

  return {
    allowed: true,
    remaining: RATE_LIMIT.MAX_SUBMISSIONS - (count + 1)
  }
}

export async function submitScore(
  submission: ScoreSubmission
): Promise<{ success: boolean; error?: string; entry?: LeaderboardEntry }> {
  try {
    // Parse and validate submission data
    const validatedData = ScoreSubmissionSchema.parse(submission)

    // Get IP for rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] || 'unknown'

    // Check rate limit
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again later. Remaining attempts: ${rateLimit.remaining}`
      }
    }

    // Verify score is legitimate
    if (!verifyScore(validatedData)) {
      return { success: false, error: 'Invalid score submission' }
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

    // Store entry in Redis
    await redis.zadd(LEADERBOARD_KEY, {
      score: entry.score,
      member: JSON.stringify(entry)
    })

    // Keep only top scores
    await redis.zremrangebyrank(LEADERBOARD_KEY, 0, -LEADERBOARD_LIMIT - 1)

    return { success: true, entry }
  } catch (error) {
    console.error('Failed to submit score:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid submission data format' }
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
