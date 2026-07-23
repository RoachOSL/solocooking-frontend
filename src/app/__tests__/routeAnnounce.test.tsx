/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

function renderApp() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <h1>Home</h1>, handle: { title: 'Home' } },
          {
            path: 'ingredients',
            element: <h1>Ingredients</h1>,
            handle: { title: 'Ingredients' },
          },
        ],
      },
    ],
    { initialEntries: ['/'] },
  )
  // App renders GlobalLoadingBar, which needs a QueryClient in context.
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('route announcing', () => {
  // Embers off so the canvas/matchMedia path is skipped in jsdom.
  beforeEach(() => localStorage.setItem('embers', 'off'))

  it('titles the document per route and moves focus to main on navigation', async () => {
    renderApp()
    await waitFor(() => expect(document.title).toBe('Home · SoloCooking'))

    fireEvent.click(screen.getByRole('link', { name: 'Ingredients' }))

    await waitFor(() =>
      expect(document.title).toBe('Ingredients · SoloCooking'),
    )
    await waitFor(() => expect(document.activeElement?.tagName).toBe('MAIN'))
    expect(
      screen.getByText('Ingredients', { selector: '[aria-live]' }),
    ).toBeInTheDocument()
  })
})
