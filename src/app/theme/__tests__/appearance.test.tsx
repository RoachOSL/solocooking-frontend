/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'

// The palette and the theme are not independent: soloCookingSystem has no light
// mode, so entering it forces dark and going light drops it. These are the
// tests for that pairing — without them the app can reach a state whose tokens
// do not exist in src/index.css.

function renderApp() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [{ index: true, element: null }],
      },
    ],
    { initialEntries: ['/'] },
  )
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function setAppearance(palette: string, theme: 'light' | 'dark') {
  localStorage.setItem('palette', palette)
  localStorage.setItem('theme', theme)
  document.documentElement.dataset.palette = palette
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const root = document.documentElement
const pot = () => screen.getByRole('button', { name: 'COOK' })

describe('palette and theme pairing', () => {
  beforeEach(() => {
    localStorage.clear()
    root.classList.remove('dark')
    root.dataset.palette = 'ember'
  })

  it('the pot enters the system palette and forces dark', () => {
    setAppearance('ember', 'light')
    renderApp()

    fireEvent.click(pot())

    expect(root.dataset.palette).toBe('soloCookingSystem')
    expect(root.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('the pot returns to ember and leaves the theme alone', () => {
    setAppearance('soloCookingSystem', 'dark')
    renderApp()

    fireEvent.click(pot())

    expect(root.dataset.palette).toBe('ember')
    expect(root.classList.contains('dark')).toBe(true)
  })

  it('switching to light drops the system palette', () => {
    setAppearance('soloCookingSystem', 'dark')
    renderApp()

    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    )

    expect(root.dataset.palette).toBe('ember')
    expect(root.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('palette')).toBe('ember')
  })

  it('switching to dark keeps the current palette', () => {
    setAppearance('ember', 'light')
    renderApp()

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))

    expect(root.dataset.palette).toBe('ember')
    expect(root.classList.contains('dark')).toBe(true)
  })
})
