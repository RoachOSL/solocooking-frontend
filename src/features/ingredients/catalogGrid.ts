/*
 * Copyright (c) 2026 dev.soloprogramming
 */

// The catalog grid and the page size are one decision, not two: a page whose
// size is not divisible by the column count ends on a ragged row. Kept together
// here, with catalogGrid.test.ts as the check that they stay in agreement.

// Six full rows at the widest tier.
export const PAGE_SIZE = 30

// Four columns are deliberately absent — 30 does not divide by 4.
export const CARD_GRID =
  'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'

// Never more than a request can return, or the grid is guaranteed to collapse.
export const SKELETON_COUNT = PAGE_SIZE

// How many placeholders fill a screen depends on columns, which CSS decides —
// so CSS decides the count too, by hiding everything past each breakpoint's
// screenful. Every tier is a whole number of rows.
export function skeletonVisibility(index: number) {
  if (index < 6) {
    return ''
  }
  if (index < 8) {
    return 'hidden sm:flex'
  }
  if (index < 12) {
    return 'hidden lg:flex'
  }
  return 'hidden xl:flex'
}

// Bars of one width read as a table, which is not what arrives. The length
// shares no factor with any column count, so the cycle never settles into
// vertical stripes.
export const SKELETON_WIDTHS = [
  'w-24',
  'w-32',
  'w-20',
  'w-28',
  'w-36',
  'w-24',
  'w-32',
]
