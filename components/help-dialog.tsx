'use client'

import {
  Ghost,
  Keyboard,
  Minimize2,
  Shuffle,
  Smartphone,
  Space,
  Target,
  Timer,
  Trophy,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How to Play</DialogTitle>
          <DialogDescription>
            Learn the controls and rules of Block Blitz
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="controls" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 gap-2">
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="power-ups">Power-Ups</TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Keyboard className="size-5" />
                    Keyboard Controls
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <kbd className="rounded border px-2 font-mono">←</kbd>
                        <span>or</span>
                        <kbd className="rounded border px-2 font-mono">A</kbd>
                      </span>
                      <span className="text-muted-foreground">Move Left</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <kbd className="rounded border px-2 font-mono">→</kbd>
                        <span>or</span>
                        <kbd className="rounded border px-2 font-mono">D</kbd>
                      </span>
                      <span className="text-muted-foreground">Move Right</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <kbd className="rounded border px-2 font-mono">↑</kbd>
                        <span>or</span>
                        <kbd className="rounded border px-2 font-mono">W</kbd>
                      </span>
                      <span className="text-muted-foreground">Rotate</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <kbd className="rounded border px-2 font-mono">↓</kbd>
                        <span>or</span>
                        <kbd className="rounded border px-2 font-mono">S</kbd>
                      </span>
                      <span className="text-muted-foreground">Soft Drop</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 rounded border px-2 font-mono">
                        <Space className="size-4" />
                      </span>
                      <span className="text-muted-foreground">Hard Drop</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <kbd className="rounded border px-2 font-mono">P</kbd>
                      </span>
                      <span className="text-muted-foreground">Pause Game</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Smartphone className="size-5" />
                    Touch Controls
                  </h3>
                  <p className="text-muted-foreground">
                    On mobile devices, use the on-screen buttons to control the
                    game. Tap and hold movement buttons for continuous movement.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Target className="size-5" />
                    Basic Rules
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    <li>Blocks fall from the top of the board</li>
                    <li>Complete lines to clear them and score points</li>
                    <li>Game ends if blocks reach the top</li>
                    <li>Clear multiple lines at once for bonus points</li>
                    <li>Level increases every 10 lines cleared</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Trophy className="size-5" />
                    Win Conditions
                  </h3>
                  <p className="text-muted-foreground">
                    Reach the target score before time runs out. The game gets
                    faster as your level increases. Keep the board clear and
                    plan your moves carefully!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="scoring" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Point System</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Single Line</span>
                      <span className="text-muted-foreground">100 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Double Line</span>
                      <span className="text-muted-foreground">300 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Triple Line</span>
                      <span className="text-muted-foreground">500 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tetris (4 Lines)</span>
                      <span className="text-muted-foreground">800 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Soft Drop</span>
                      <span className="text-muted-foreground">
                        1 point per cell
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hard Drop</span>
                      <span className="text-muted-foreground">
                        2 points per cell
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">Level Bonuses</h3>
                  <p className="mb-2 text-muted-foreground">
                    All points are multiplied by current level number
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Level 1</span>
                      <span className="text-muted-foreground">×1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level 2</span>
                      <span className="text-muted-foreground">×1.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level 3</span>
                      <span className="text-muted-foreground">×1.4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level 4+</span>
                      <span className="text-muted-foreground">×1.6</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="power-ups" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    Special Power-ups
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-red-500/20">
                        <Zap className="size-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Color Bomb</h4>
                        <p className="text-sm text-muted-foreground">
                          Clears blocks in waves from the impact point
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-yellow-500/20">
                        <Minimize2 className="size-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Line Blast</h4>
                        <p className="text-sm text-muted-foreground">
                          Clears entire row and column where piece lands
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-cyan-500/20">
                        <Timer className="size-5 text-cyan-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Time Freeze</h4>
                        <p className="text-sm text-muted-foreground">
                          Freezes block descent for 10 seconds
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-green-500/20">
                        <Ghost className="size-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Ghost Block</h4>
                        <p className="text-sm text-muted-foreground">
                          Allows pieces to pass through other blocks for 15
                          seconds
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-purple-500/20">
                        <Shuffle className="size-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Shuffle</h4>
                        <p className="text-sm text-muted-foreground">
                          Reorganizes placed blocks while maintaining vertical
                          stacking
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    Power-up Chances
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Power-ups appear randomly with increasing frequency as you
                    score more points:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Base chance starts at 8.5%</li>
                    <li>+1% per 500 points scored (max 15% bonus)</li>
                    <li>+2% per 1000 points (level bonus)</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
