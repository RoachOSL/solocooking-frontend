/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useState } from 'react'

export type Theme = 'light' | 'dark'

// Key and values must match the inline script in index.html, which applies the
// theme before first paint. Pairing it with the palette is App's job.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  function setTheme(next: Theme) {
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
    setThemeState(next)
  }

  return { theme, setTheme }
}
