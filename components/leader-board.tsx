'use client'

import { motion } from 'framer-motion'
import { Medal, Shield, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getLeaderboard } from '@/actions/leaderboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AdminLeaderboard } from '@/components/admin-leader-board'

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  level: number
  lines: number
  timestamp: number
  rank?: number
}

interface LeaderBoardProps {
  onClose: () => void
}

export function LeaderBoard({ onClose }: LeaderBoardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true)
      const data = await getLeaderboard()
      setEntries(data)
    } catch (error) {
      setError('Failed to load leaderboard')
      console.error('Leaderboard fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  return (
    <div className="mt-4 space-y-4">
      {/* Header with Admin Button */}
      <div className="relative">
        <h3 className="text-xl font-semibold">Global Rankings</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAdmin(true)}
          className="absolute right-0 top-0"
          aria-label="Admin settings"
        >
          <Shield className="size-4" />
        </Button>
      </div>

      <Separator />

      {error ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="mt-2"
          >
            Retry
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-muted/50"
                  />
                ))
              : entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent',
                      index < 3 && 'border-primary/20'
                    )}
                  >
                    <div className="flex size-8 items-center justify-center">
                      {index === 0 && (
                        <Trophy className="size-5 text-yellow-500" />
                      )}
                      {index === 1 && (
                        <Medal className="size-5 text-zinc-400" />
                      )}
                      {index === 2 && (
                        <Medal className="size-5 text-amber-700" />
                      )}
                      {index > 2 && (
                        <span className="text-sm text-muted-foreground">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-medium">{entry.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {entry.level} • {entry.lines} lines
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold tabular-nums">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Admin Dialog */}
      {showAdmin && (
        <AdminLeaderboard
          entries={entries}
          onClose={() => setShowAdmin(false)}
          onRefresh={fetchLeaderboard}
        />
      )}
    </div>
  )
}
