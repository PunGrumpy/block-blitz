import { motion } from 'framer-motion'
import { Command, Crown, Gamepad2, Timer } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface WelcomeScreenProps {
  onStart: () => void
  isOpen: boolean
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
}

export default function WelcomeScreen({ onStart, isOpen }: WelcomeScreenProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-center text-4xl font-bold tracking-tight">
              Block Blitz
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              A modern take on classic block-falling puzzle games
            </DialogDescription>
          </DialogHeader>

          <motion.div
            variants={itemVariants}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="size-5 text-yellow-500" />
                  Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-inside space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Timer className="mt-0.5 size-4 shrink-0" />
                    <span>Clear lines before time runs out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="mt-0.5 size-4 shrink-0" />
                    <span>Reach target score to win</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Command className="mt-0.5 size-4 shrink-0" />
                    <span>Use power-ups to boost score</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gamepad2 className="size-5 text-emerald-500" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-1.5">
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        ←
                      </kbd>
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        →
                      </kbd>
                      <span className="mx-1 text-muted-foreground">or</span>
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        A
                      </kbd>
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        D
                      </kbd>
                    </div>
                    <span className="text-muted-foreground">Move Block</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-1.5">
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        ↑
                      </kbd>
                      <span className="mx-1 text-muted-foreground">or</span>
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        W
                      </kbd>
                    </div>
                    <span className="text-muted-foreground">Rotate Block</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-1.5">
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        ↓
                      </kbd>
                      <span className="mx-1 text-muted-foreground">or</span>
                      <kbd className="rounded border px-1.5 font-mono shadow-sm">
                        S
                      </kbd>
                    </div>
                    <span className="text-muted-foreground">Soft Drop</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <kbd className="rounded border px-2 font-mono shadow-sm">
                      Space
                    </kbd>
                    <span className="text-muted-foreground">Hard Drop</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <kbd className="rounded border px-1.5 font-mono shadow-sm">
                      P
                    </kbd>
                    <span className="text-muted-foreground">Pause Game</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Separator />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4"
          >
            <Button size="lg" className="text-lg" onClick={onStart}>
              Start Game
            </Button>
            <p className="text-sm text-muted-foreground">
              Press{' '}
              <kbd className="rounded border px-1.5 font-mono shadow-sm">H</kbd>{' '}
              anytime for help
            </p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
