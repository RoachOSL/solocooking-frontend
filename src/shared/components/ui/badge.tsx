/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import * as React from 'react'
import { Slot } from 'radix-ui'

import { cn } from '@/shared/lib/utils'

// The pill that marks a small piece of status: a level, a reward, a field the
// backend does not store yet. One definition, because four hand-written copies
// had already drifted apart on padding and weight.
function Badge({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary',
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
