'use client';

import {
  Eye,
  EyeOff,
  Grid,
  Settings2,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface GameSettings {
  audio: {
    enabled: boolean;
    volume: number;
    effects: boolean;
    music: boolean;
  };
  display: {
    showGhost: boolean;
    showGrid: boolean;
    particles: boolean;
  };
}

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export function GameSettings({ settings, onSettingsChange }: GameSettingsProps) {
  const updateSettings = <K extends keyof GameSettings, SK extends keyof GameSettings[K]>(
    category: K,
    setting: SK,
    value: GameSettings[K][SK]
  ) => {
    onSettingsChange({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value,
      },
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <Settings2 className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Game Settings</SheetTitle>
          <SheetDescription>
            Customize your gaming experience
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Audio Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Audio Settings</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.audio.enabled ? (
                  <Volume2 className="size-4" />
                ) : (
                  <VolumeX className="size-4" />
                )}
                <Label htmlFor="audio-toggle">Sound Enabled</Label>
              </div>
              <Switch
                id="audio-toggle"
                checked={settings.audio.enabled}
                onCheckedChange={(checked) =>
                  updateSettings('audio', 'enabled', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume-slider">Volume</Label>
              <Slider
                id="volume-slider"
                min={0}
                max={100}
                step={1}
                value={[settings.audio.volume]}
                onValueChange={([value]) =>
                  updateSettings('audio', 'volume', value)
                }
                disabled={!settings.audio.enabled}
                aria-label="Volume"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="effects-toggle">Sound Effects</Label>
                <Switch
                  id="effects-toggle"
                  checked={settings.audio.effects}
                  onCheckedChange={(checked) =>
                    updateSettings('audio', 'effects', checked)
                  }
                  disabled={!settings.audio.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="music-toggle">Background Music</Label>
                <Switch
                  id="music-toggle"
                  checked={settings.audio.music}
                  onCheckedChange={(checked) =>
                    updateSettings('audio', 'music', checked)
                  }
                  disabled={!settings.audio.enabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Visual Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Visual Settings</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.display.showGhost ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
                <Label htmlFor="ghost-toggle">Ghost Piece</Label>
              </div>
              <Switch
                id="ghost-toggle"
                checked={settings.display.showGhost}
                onCheckedChange={(checked) =>
                  updateSettings('display', 'showGhost', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="size-4" />
                <Label htmlFor="grid-toggle">Show Grid</Label>
              </div>
              <Switch
                id="grid-toggle"
                checked={settings.display.showGrid}
                onCheckedChange={(checked) =>
                  updateSettings('display', 'showGrid', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4" />
                <Label htmlFor="particles-toggle">Visual Effects</Label>
              </div>
              <Switch
                id="particles-toggle"
                checked={settings.display.particles}
                onCheckedChange={(checked) =>
                  updateSettings('display', 'particles', checked)
                }
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}