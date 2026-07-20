/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { CookEasterEgg } from './CookEasterEgg'
import { Embers } from './Embers'
import { EmbersToggle } from './EmbersToggle'
import {
  applyPalette,
  DEFAULT_PALETTE,
  EMBER_PRESETS,
  readPalette,
  supportsLight,
  type PaletteValue,
} from './palettes'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './useTheme'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'text-sm transition-colors',
    isActive
      ? 'font-medium text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  )
}

export default function App() {
  // The inline script in index.html already applied the stored palette; this
  // only mirrors it into React state.
  const [palette, setPalette] = useState<PaletteValue>(readPalette)
  const { theme, setTheme } = useTheme()
  const [embersEnabled, setEmbersEnabled] = useState(
    () => localStorage.getItem('embers') !== 'off',
  )
  const embers = EMBER_PRESETS[palette]

  function changePalette(next: PaletteValue) {
    applyPalette(next)
    setPalette(next)
  }

  // There is no palette picker; the pot is the only way in and out.
  function togglePalette() {
    const next: PaletteValue =
      palette === 'ember' ? 'soloCookingSystem' : DEFAULT_PALETTE
    changePalette(next)
    if (!supportsLight(next)) {
      setTheme('dark')
    }
  }

  // Going light drops any palette that has no light mode, rather than leaving
  // the page with tokens that do not exist.
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (next === 'light' && !supportsLight(palette)) {
      changePalette(DEFAULT_PALETTE)
    }
  }

  function toggleEmbers() {
    const next = !embersEnabled
    localStorage.setItem('embers', next ? 'on' : 'off')
    setEmbersEnabled(next)
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <Embers
        density={embersEnabled ? embers.density : 'off'}
        colorMode={embers.colorMode}
      />
      <header className="relative z-10 border-b">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 p-4">
          <span className="flex items-center gap-2">
            <CookEasterEgg onCook={togglePalette} />
            <Link to="/" className="text-lg font-bold">
              SoloCooking
            </Link>
          </span>
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/recipes" className={navLinkClass}>
            Recipes
          </NavLink>
          <NavLink to="/ingredients" className={navLinkClass}>
            Ingredients
          </NavLink>
          <div className="ml-auto flex items-center gap-2">
            {/* Mock chef level until progression exists. */}
            <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium text-primary">
              Chef Lv. 3
            </span>
            <EmbersToggle enabled={embersEnabled} onToggle={toggleEmbers} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </nav>
      </header>
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
