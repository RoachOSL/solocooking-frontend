/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { Flame } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface EmbersToggleProps {
  enabled: boolean
  onToggle: () => void
}

export function EmbersToggle({ enabled, onToggle }: EmbersToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={enabled}
      aria-label={
        enabled ? 'Turn off background embers' : 'Turn on background embers'
      }
      onClick={onToggle}
    >
      <Flame className={enabled ? 'text-primary' : 'text-muted-foreground'} />
    </Button>
  )
}
