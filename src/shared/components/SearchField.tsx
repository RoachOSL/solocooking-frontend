/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import type { ComponentProps, ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

// The icon's offset and the input's left padding are one measurement; two
// copies drift. `className` styles the wrapper, since that is what callers
// place; `children` renders inside it, for adornments the field itself should
// not know about.
export function SearchField({
  className,
  children,
  ...props
}: ComponentProps<'input'> & { children?: ReactNode }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        className="h-12 rounded-lg bg-card pl-11 text-base shadow-sm disabled:opacity-80"
        {...props}
      />
      {children}
    </div>
  )
}
