/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

// One width for every page and for the nav above them — a page that sets its
// own drifts from the header the day either changes. 90rem is a catalog width,
// not a reading width: card grids get the room, and prose caps itself on the
// element that holds it (`max-w-xl` on a paragraph). Padding is mobile-first.
export const PAGE_CONTAINER = 'mx-auto w-full max-w-[90rem] px-4 sm:px-6'

export function PageSection({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section className={cn(PAGE_CONTAINER, 'py-6', className)} {...props} />
  )
}
