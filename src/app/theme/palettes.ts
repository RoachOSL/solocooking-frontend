/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import type { EmberColorMode, EmberDensity } from './Embers'

// The palette is the data-palette attribute on <html>; each value has its own
// complete token blocks in src/index.css. Storage key and values must match the
// inline script in index.html, which applies the palette before first paint.
export type PaletteValue = 'ember' | 'soloCookingSystem'

export const PALETTE_VALUES: PaletteValue[] = ['ember', 'soloCookingSystem']

export const DEFAULT_PALETTE: PaletteValue = 'ember'

// Which modes each palette ships. soloCookingSystem is a night skin: its navy
// and neon lose all their character on white, so it has no light mode and
// entering it forces dark. src/index.css holds a block per entry here.
export const PALETTE_MODES: Record<PaletteValue, ('light' | 'dark')[]> = {
  ember: ['light', 'dark'],
  soloCookingSystem: ['dark'],
}

export function supportsLight(palette: PaletteValue): boolean {
  return PALETTE_MODES[palette].includes('light')
}

interface EmberPreset {
  density: EmberDensity
  colorMode: EmberColorMode
}

// The ember look is part of the palette, not a user setting: fire over cast
// iron, mana over the SoloCooking System navy.
export const EMBER_PRESETS: Record<PaletteValue, EmberPreset> = {
  ember: { density: 'storm', colorMode: 'fire' },
  soloCookingSystem: { density: 'storm', colorMode: 'mana' },
}

function isPaletteValue(value: string | null): value is PaletteValue {
  return PALETTE_VALUES.some((palette) => palette === value)
}

export function readPalette(): PaletteValue {
  const stored = localStorage.getItem('palette')
  // A stored value may name a palette dropped in the meantime.
  return isPaletteValue(stored) ? stored : DEFAULT_PALETTE
}

export function applyPalette(palette: PaletteValue) {
  localStorage.setItem('palette', palette)
  document.documentElement.dataset.palette = palette
}
