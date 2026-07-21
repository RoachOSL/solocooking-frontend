/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { describe, expect, it } from 'vitest'
import {
  CARD_GRID,
  PAGE_SIZE,
  SKELETON_COUNT,
  SKELETON_WIDTHS,
  skeletonVisibility,
} from '../catalogGrid'

// Reading the columns out of the class list rather than restating them is the
// point: a breakpoint added to CARD_GRID is checked without touching this file.
const BREAKPOINTS = ['base', 'sm', 'lg', 'xl'] as const
type Breakpoint = (typeof BREAKPOINTS)[number]

function columnsByBreakpoint(): Partial<Record<Breakpoint, number>> {
  const columns: Partial<Record<Breakpoint, number>> = {}
  for (const token of CARD_GRID.split(' ')) {
    const match = /^(?:([a-z0-9]+):)?grid-cols-(\d+)$/.exec(token)
    if (match) {
      columns[(match[1] ?? 'base') as Breakpoint] = Number(match[2])
    }
  }
  return columns
}

// Which breakpoint a placeholder first appears at: '' means it is always shown.
function tierOf(index: number): Breakpoint {
  const visibility = skeletonVisibility(index)
  return visibility === ''
    ? 'base'
    : ((/hidden ([a-z0-9]+):flex/.exec(visibility)?.[1] ??
        'base') as Breakpoint)
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

const columns = columnsByBreakpoint()

describe('ingredient catalog grid', () => {
  it('declares a column count for every breakpoint the tiers use', () => {
    const used = new Set(
      Array.from({ length: SKELETON_COUNT }, (_, index) => tierOf(index)),
    )
    for (const breakpoint of used) {
      expect(columns[breakpoint], `${breakpoint} in CARD_GRID`).toBeDefined()
    }
  })

  // A full page that does not divide by the column count ends on a part-row,
  // and which breakpoint it bites at depends on the reader's window.
  it.each(Object.entries(columns))(
    'fills whole rows at %s (%i columns)',
    (_breakpoint, count) => {
      expect(PAGE_SIZE % count).toBe(0)
    },
  )

  // Placeholders stand in for cards, so a part-row here is the same defect
  // arriving a moment earlier.
  it.each(BREAKPOINTS.filter((breakpoint) => columns[breakpoint]))(
    'shows whole rows of placeholders at %s',
    (breakpoint) => {
      const upTo = BREAKPOINTS.indexOf(breakpoint)
      const visible = Array.from(
        { length: SKELETON_COUNT },
        (_, index) => index,
      ).filter((index) => BREAKPOINTS.indexOf(tierOf(index)) <= upTo)

      expect(visible.length % columns[breakpoint]!).toBe(0)
      expect(visible.length).toBeGreaterThan(0)
    },
  )

  it('never promises more placeholders than a page can return', () => {
    expect(SKELETON_COUNT).toBeLessThanOrEqual(PAGE_SIZE)
  })

  // Sharing a factor with the column count parks every width in a fixed column,
  // turning the placeholders into vertical stripes.
  it.each(Object.entries(columns))(
    'cycles placeholder widths clear of a %s (%i column) pattern',
    (_breakpoint, count) => {
      expect(greatestCommonDivisor(SKELETON_WIDTHS.length, count)).toBe(1)
    },
  )
})
