import { HelpCircle, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface SiteHeaderProps {
  onToggleSound?: () => void
  isSoundEnabled?: boolean
  onShowHelp?: () => void
}

export function SiteHeader({
  onToggleSound,
  isSoundEnabled = true,
  onShowHelp
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold tracking-tight">Block Blitz</h1>
        </div>

        {(onToggleSound || onShowHelp) && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {onToggleSound && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleSound}
                      className="size-8"
                    >
                      {isSoundEnabled ? (
                        <Volume2 className="size-4" />
                      ) : (
                        <VolumeX className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSoundEnabled ? 'Mute sound' : 'Enable sound'}
                  </TooltipContent>
                </Tooltip>
              )}

              {onShowHelp && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onShowHelp}
                      className="size-8"
                    >
                      <HelpCircle className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show help</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}
      </div>
    </header>
  )
}
