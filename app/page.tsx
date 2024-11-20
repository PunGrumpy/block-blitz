import { GameLayout } from '@/components/game-layout'
import { DEFAULT_CONFIG } from '@/constants/game'

export default function GamePage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <GameLayout config={DEFAULT_CONFIG} />
    </div>
  )
}
