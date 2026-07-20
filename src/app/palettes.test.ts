/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { describe, expect, it } from 'vitest'
import css from '../index.css?raw'
import { PALETTE_MODES, PALETTE_VALUES } from './palettes'

// Every palette/mode block in src/index.css is standalone: nothing falls back
// to another block, so a token missing from one of them renders as an unset
// value rather than as another palette's color. This test is the guard — it
// fails the moment the blocks stop declaring the same token names, or the CSS
// stops matching the modes PALETTE_MODES promises.

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

  // A block for a mode a palette does not ship is dead code that would quietly
  // come back to life the day the palette gains that mode.
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
