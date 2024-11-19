'use client'

import { Trash2, LogOut, Shield } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  authenticateAdmin,
  deleteLeaderboardEntry,
  logoutAdmin
} from '@/actions/admin'

interface AdminLeaderboardProps {
  entries: any[]
  onClose: () => void
  onRefresh: () => void
}

export function AdminLeaderboard({
  entries,
  onClose,
  onRefresh
}: AdminLeaderboardProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (formData: FormData) => {
    try {
      setIsLoading(true)
      setError('')
      const result = await authenticateAdmin(formData)

      if (result.success) {
        setIsAuthenticated(true)
        setIsAuthenticating(false)
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (error) {
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logoutAdmin()
    setIsAuthenticated(false)
    setIsAuthenticating(true)
  }

  const handleDelete = async (entryId: string) => {
    try {
      setIsLoading(true)
      const result = await deleteLeaderboardEntry(entryId)

      if (result.success) {
        onRefresh()
      } else {
        setError(result.error || 'Failed to delete entry')
      }
    } catch (error) {
      setError('Failed to delete entry')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Admin Dashboard
          </DialogTitle>
          <DialogDescription>
            {isAuthenticating
              ? 'Enter admin secret to manage leaderboard'
              : 'Manage leaderboard entries'}
          </DialogDescription>
        </DialogHeader>

        {isAuthenticating ? (
          <form action={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                name="secret"
                placeholder="Enter admin secret"
                required
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Login'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    'hover:bg-muted/50'
                  )}
                >
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {entry.score.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    disabled={isLoading}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${entry.name}'s entry`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoading}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
              <Button onClick={onClose} disabled={isLoading}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
