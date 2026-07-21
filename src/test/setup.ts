/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetIngredients } from './msw/handlers'
import { server } from './msw/server'

// jsdom implements neither API. The suite answers "yes" to reduced motion, so
// decorative animation never starts and tests never depend on canvas.
window.matchMedia = ((query: string) => ({
  matches: query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia

window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetIngredients()
})
afterAll(() => server.close())
