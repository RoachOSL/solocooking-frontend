/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { Theme } from './useTheme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
