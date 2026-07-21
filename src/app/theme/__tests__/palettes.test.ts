/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { describe, expect, it } from 'vitest'
import css from '../../../index.css?raw'
import { PALETTE_MODES, PALETTE_VALUES } from '../palettes'

// Blocks in src/index.css are standalone, so a token missing from one renders
// unset rather than falling back. This is the guard against that drift.

function selectorFor(palette: string, mode: string): string {
  const base = `[data-palette='${palette}']`
  return mode === 'dark' ? `${base}.dark` : base
}

function blockFor(selector: string): string | null {
  const start = css.indexOf(`${selector} {`)
  return start === -1 ? null : css.slice(start, css.indexOf('\n}', start))
}

function tokensIn(selector: string): string[] {
  const body = blockFor(selector)
  expect(body, `no block for ${selector} in src/index.css`).not.toBeNull()
  return [...(body ?? '').matchAll(/^ {2}--([a-z-]+):/gm)].map(
    (match) => match[1],
  )
}

const blocks = PALETTE_VALUES.flatMap((palette) =>
  PALETTE_MODES[palette].map((mode) => selectorFor(palette, mode)),
)

describe('palette tokens', () => {
  it.each(blocks)('%s declares no token twice', (selector) => {
    const tokens = tokensIn(selector)
    expect(tokens).toEqual([...new Set(tokens)])
  })

  it('every block declares the same tokens', () => {
    const expected = [...tokensIn(blocks[0])].sort()
    expect(expected.length).toBeGreaterThan(0)
    for (const selector of blocks.slice(1)) {
      expect([...tokensIn(selector)].sort(), selector).toEqual(expected)
    }
  })

  // A light block for a dark-only palette is not merely unused: its selector
  // matches in dark mode too, so every token the dark block omits falls back to
  // it. No other test looks here — the rest iterate PALETTE_MODES.
  it.each(PALETTE_VALUES)(
    '%s ships no block outside PALETTE_MODES',
    (palette) => {
      const missing = (['light', 'dark'] as const).filter(
        (mode) => !PALETTE_MODES[palette].includes(mode),
      )
      for (const mode of missing) {
        expect(
          blockFor(selectorFor(palette, mode)),
          `${palette} ${mode}`,
        ).toBeNull()
      }
    },
  )
})
