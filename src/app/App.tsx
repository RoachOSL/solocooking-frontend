/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatches,
  type UIMatch,
} from 'react-router'
import { PAGE_CONTAINER } from '@/shared/components/PageSection'
import { Badge } from '@/shared/components/ui/badge'
import { Toaster } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/utils'
import { GlobalLoadingBar } from './GlobalLoadingBar'
import { CookEasterEgg } from './theme/CookEasterEgg'
import { Embers } from './theme/Embers'
import { EmbersToggle } from './theme/EmbersToggle'
import {
  applyPalette,
  DEFAULT_PALETTE,
  EMBER_PRESETS,
  readPalette,
  supportsLight,
  type PaletteValue,
} from './theme/palettes'
import { ThemeToggle } from './theme/ThemeToggle'
import { useTheme } from './theme/useTheme'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'text-sm transition-colors',
    isActive
      ? 'font-medium text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  )
}

type RouteHandle = { title?: string }

// Deepest matched route with a title wins.
function routeTitle(matches: UIMatch[]): string | undefined {
  for (let index = matches.length - 1; index >= 0; index--) {
    const handle = matches[index].handle as RouteHandle | undefined
    if (handle?.title) {
      return handle.title
    }
  }
  return undefined
}

export default function App() {
  // index.html already applied the stored palette; this only mirrors it.
  const [palette, setPalette] = useState<PaletteValue>(readPalette)
  const { theme, setTheme } = useTheme()
  const [embersEnabled, setEmbersEnabled] = useState(
    () => localStorage.getItem('embers') !== 'off',
  )
  const embers = EMBER_PRESETS[palette]

  const matches = useMatches()
  const { pathname } = useLocation()
  const title = routeTitle(matches)
  const mainRef = useRef<HTMLElement>(null)
  const [announcement, setAnnouncement] = useState('')
  const isFirstRender = useRef(true)

  useEffect(() => {
    document.title = title ? `${title} · SoloCooking` : 'SoloCooking'
  }, [title])

  // No browser cue on a client-side route change: move focus and announce it.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
    setAnnouncement(title ?? 'Page changed')
  }, [pathname, title])

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

  // Going light drops a palette that has no light mode, rather than leaving the
  // page on tokens that do not exist.
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
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      <Embers
        density={embersEnabled ? embers.density : 'off'}
        colorMode={embers.colorMode}
      />
      <header className="relative z-10 border-b">
        <nav
          className={cn(
            PAGE_CONTAINER,
            'flex flex-wrap items-center gap-x-4 gap-y-2 py-4',
          )}
        >
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
            <Badge>Chef Lv. 3</Badge>
            <EmbersToggle enabled={embersEnabled} onToggle={toggleEmbers} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </nav>
        <GlobalLoadingBar />
      </header>
      {/* pb-24 keeps the last block clear of the glow below. */}
      <main
        ref={mainRef}
        tabIndex={-1}
        className="relative z-10 flex-1 pb-24 outline-none"
      >
        <Outlet />
      </main>
      {/* Anchored to the shell rather than the viewport, so it sits at the foot
          of the page instead of following the scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_72%)]"
      />
      <Toaster theme={theme} />
      <div aria-live="polite" aria-atomic className="sr-only">
        {announcement}
      </div>
    </div>
  )
}
