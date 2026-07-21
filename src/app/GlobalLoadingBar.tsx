/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useEffect, useRef, useState } from 'react'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

// A bar that appears and vanishes within a few frames reads as a glitch, so a
// fast request never gets one, and a bar that did show stays long enough to be
// read.
const SHOW_AFTER_MS = 250
const MIN_VISIBLE_MS = 400

function useSustained(active: boolean) {
  const [visible, setVisible] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (active) {
      if (visible) {
        return
      }
      const timeout = setTimeout(() => {
        shownAt.current = Date.now()
        setVisible(true)
      }, SHOW_AFTER_MS)
      return () => clearTimeout(timeout)
    }

    if (!visible) {
      return
    }
    const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt.current)
    if (remaining <= 0) {
      setVisible(false)
      return
    }
    const timeout = setTimeout(() => setVisible(false), remaining)
    return () => clearTimeout(timeout)
  }, [active, visible])

  return visible
}

// Answers "is anything happening at all" for the whole app: it counts Query's
// fetches and mutations, so a new feature is covered without wiring. A screen
// with more to say about its own loading says it in place.
export function GlobalLoadingBar() {
  const busy = useIsFetching() + useIsMutating() > 0
  const visible = useSustained(busy)

  if (!visible) {
    return null
  }

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="loading-sweep h-full w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_1px_var(--color-primary)]" />
    </div>
  )
}
