import { Card } from '@/components/ui/card'
import { GameState } from '@/types/game'

interface GameStatsProps {
  state: GameState
}

export function GameStats({ state }: GameStatsProps) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Score" value={state.score.toLocaleString()} />
        <StatCard label="Level" value={state.level} />
        <StatCard label="Lines" value={state.lines} />
        <StatCard
          label="Time"
          value={`${Math.floor(state.timeLeft / 60)}:${String(
            Math.floor(state.timeLeft % 60)
          ).padStart(2, '0')}`}
        />
      </div>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-md bg-muted px-2 py-1 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}
