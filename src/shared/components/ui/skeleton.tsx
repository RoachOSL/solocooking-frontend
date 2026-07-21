/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/utils'

// Callers size it like the thing it stands in for, so real content lands
// without moving anything. motion-safe: with the animation off it is still a
// block where content is not.
function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)}
      {...props}
    />
  )
}

export { Skeleton }
