'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function GameControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
        <CardDescription>
          Use keyboard controls to play the game
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-sm font-medium">Move Left</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-10">
              ←
            </Button>
            <Button variant="outline" size="icon" className="size-10">
              A
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-sm font-medium">Move Right</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-10">
              →
            </Button>
            <Button variant="outline" size="icon" className="size-10">
              D
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-sm font-medium">Rotate</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-10">
              ↑
            </Button>
            <Button variant="outline" size="icon" className="size-10">
              W
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-sm font-medium">Soft Drop</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-10">
              ↓
            </Button>
            <Button variant="outline" size="icon" className="size-10">
              S
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-sm font-medium">Hard Drop</div>
          <Button variant="outline" className="justify-start">
            Space
          </Button>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-sm font-medium">Pause</div>
          <Button variant="outline" size="icon" className="size-10">
            P
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
