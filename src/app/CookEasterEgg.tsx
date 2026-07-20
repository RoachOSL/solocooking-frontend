/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CookingPot } from 'lucide-react'

interface CookEasterEggProps {
  onCook: () => void
}

// The flash doubles as cover for whatever the parent hangs on onCook, which is
// currently a palette swap.
export function CookEasterEgg({ onCook }: CookEasterEggProps) {
  const [flashing, setFlashing] = useState(false)

  function flash() {
    setFlashing(true)
    onCook()
    window.setTimeout(() => setFlashing(false), 2100)
  }

  return (
    <>
      <button
        type="button"
        aria-label="COOK"
        onClick={flash}
        className="text-brand transition-transform hover:scale-110"
      >
        <CookingPot aria-hidden className="size-5" />
      </button>
      {/* Portalled to body: the flash lives in the header, whose own z-index
          traps any stacking done inside it below the page content. */}
      {flashing &&
        createPortal(
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <span className="animate-in fade-in zoom-in-50 flash-extrude -rotate-2 bg-[image:var(--flash-gradient)] bg-clip-text text-7xl font-black tracking-[0.25em] text-transparent uppercase italic duration-300 sm:text-9xl">
              COOK!
            </span>
          </div>,
          document.body,
        )}
    </>
  )
}
