'use client'

import { Medal, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getLeaderboard } from '@/actions/leaderboard'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
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
    fetchLeaderboard()
  }, [])

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="size-5 text-yellow-500" />
      case 2:
        return <Medal className="size-5 text-zinc-400" />
      case 3:
        return <Medal className="size-5 text-amber-700" />
      default:
        return null
    }
  }

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Leaderboard</h3>
        {error ? (
          <div className="rounded-lg border border-destructive p-4 text-center text-destructive">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-muted-foreground">Loading leaderboard...</div>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-3 transition-colors',
                    index < 3 && 'bg-muted/50'
                  )}
                >
                  <div className="flex size-8 items-center justify-center font-mono">
                    {getMedalIcon(index + 1) ?? entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Level {entry.level} • {entry.lines} lines
                    </div>
                  </div>
                  <div className="font-mono text-lg font-medium">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </>
  )
}
