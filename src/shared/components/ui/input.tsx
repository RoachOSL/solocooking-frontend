/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// Exported so a control this file does not own (a native `<select>`, a future
// textarea) matches the text input by reference, not by a copy of its classes.
export const FIELD_SHELL = cn(
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
)

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        FIELD_SHELL,
        'selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
