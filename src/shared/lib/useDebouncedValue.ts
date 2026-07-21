/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useEffect, useState } from 'react'

// Holds a value back until it stops changing, so a query fires once per pause
// in typing rather than once per keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
