import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()

const LEADERBOARD_KEY = 'block-blitz-leaderboard'
const LEADERBOARD_LIMIT = 100

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  level: number
  lines: number
  timestamp: number
}

interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number
}

export async function GET() {
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

    console.log('Redis response:', entries)

    if (!entries || entries.length === 0) {
      return NextResponse.json([])
    }

    // Process entries to create ranked leaderboard
    const leaderboard: RankedLeaderboardEntry[] = []
    for (let i = 0; i < entries.length; i += 2) {
      const entry = entries[i]

      // Skip if entry is a number (score) or invalid
      if (typeof entry === 'number' || !entry) {
        continue
      }

      // Validate entry has required fields
      if (
        'id' in entry &&
        'name' in entry &&
        'score' in entry &&
        'level' in entry &&
        'lines' in entry &&
        'timestamp' in entry
      ) {
        leaderboard.push({
          ...entry,
          rank: leaderboard.length + 1
        } as RankedLeaderboardEntry)
      } else {
        console.error('Invalid entry format:', entry)
      }
    }

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, score, level, lines } = body

    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid entry data' }, { status: 400 })
    }

    const entry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      name,
      score,
      level,
      lines,
      timestamp: Date.now()
    }

    // Store entry as JSON string to maintain compatibility
    await redis.zadd(LEADERBOARD_KEY, {
      score: entry.score,
      member: JSON.stringify(entry)
    })

    // Keep only the top scores (remove lowest scores)
    await redis.zremrangebyrank(LEADERBOARD_KEY, 0, -LEADERBOARD_LIMIT - 1)

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to add leaderboard entry:', error)
    return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 })
  }
}
