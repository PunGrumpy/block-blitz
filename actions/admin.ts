'use server'

import { Redis } from '@upstash/redis'
import { cookies } from 'next/headers'
import { z } from 'zod'

const redis = Redis.fromEnv()
const LEADERBOARD_KEY = 'block-blitz-leaderboard'
const ADMIN_SECRET =
  process.env.ADMIN_SECRET || 'default-admin-secret-change-me'
const ADMIN_SESSION_KEY = 'admin_session'

const AdminAuthSchema = z.object({
  secret: z.string().min(1)
})

export async function authenticateAdmin(formData: FormData) {
  try {
    const secret = formData.get('secret')
    const data = AdminAuthSchema.parse({ secret })
    const session = await cookies()

    if (data.secret !== ADMIN_SECRET) {
      return { success: false, error: 'Invalid admin secret' }
    }

    // Set secure HTTP-only cookie for admin session
    session.set(ADMIN_SESSION_KEY, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    })

    return { success: true }
  } catch (error) {
    console.error('Admin authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export async function isAdminAuthenticated() {
  const session = await cookies()
  return session.has(ADMIN_SESSION_KEY)
}

export async function logoutAdmin() {
  const session = await cookies()
  session.delete(ADMIN_SESSION_KEY)
  return { success: true }
}

export async function deleteLeaderboardEntry(entryId: string) {
  try {
    if (!(await isAdminAuthenticated())) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get all entries
    const entries = await redis.zrange(LEADERBOARD_KEY, 0, -1)

    console.log('Entries:', entries)

    // Find and remove the entry with matching ID
    for (const entry of entries) {
      console.log('Type of entry:', typeof entry)
      const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry
      if (parsed.id === entryId) {
        await redis.zrem(LEADERBOARD_KEY, entry)
        return { success: true }
      }
    }

    return { success: false, error: 'Entry not found' }
  } catch (error) {
    console.error('Delete entry error:', error)
    return { success: false, error: 'Failed to delete entry' }
  }
}
