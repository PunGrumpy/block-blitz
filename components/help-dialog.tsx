'use client';

import { 
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Keyboard, 
  KeyRound,
  Smartphone, 
  Space,
  Target, 
  Trophy} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Keyboard className="size-5" />
                    Keyboard Controls
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ArrowLeft className="size-4" /> or A
                      </span>
                      <span className="text-muted-foreground">Move Left</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ArrowRight className="size-4" /> or D
                      </span>
                      <span className="text-muted-foreground">Move Right</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ArrowDown className="size-4" /> or S
                      </span>
                      <span className="text-muted-foreground">Soft Drop</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ArrowUp className="size-4" /> or W
                      </span>
                      <span className="text-muted-foreground">Rotate</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Space className="size-4" />
                      </span>
                      <span className="text-muted-foreground">Hard Drop</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <KeyRound className="size-4" /> P
                      </span>
                      <span className="text-muted-foreground">Pause Game</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Smartphone className="size-5" />
                    Touch Controls
                  </h3>
                  <p className="text-muted-foreground">
                    On mobile devices, use the on-screen buttons to control the game.
                    Tap and hold movement buttons for continuous movement.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Target className="size-5" />
                    Basic Rules
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Blocks fall from the top of the board</li>
                    <li>Complete lines to clear them and score points</li>
                    <li>Game ends if blocks reach the top</li>
                    <li>Clear multiple lines at once for bonus points</li>
                    <li>Level increases every 10 lines cleared</li>
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Trophy className="size-5" />
                    Win Conditions
                  </h3>
                  <p className="text-muted-foreground">
                    Reach the target score before time runs out. The game gets
                    faster as your level increases. Keep the board clear and plan
                    your moves carefully!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="scoring" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Point System</h3>
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
                      <span className="text-muted-foreground">1 point per cell</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hard Drop</span>
                      <span className="text-muted-foreground">2 points per cell</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Level Bonuses</h3>
                  <p className="text-muted-foreground mb-2">
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
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}