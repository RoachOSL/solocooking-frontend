/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { RecipeListPage } from './RecipeListPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecipeListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RecipeListPage', () => {
  it('renders recipes from the API', async () => {
    renderPage()

    expect(await screen.findByText('Pancakes')).toBeInTheDocument()
    expect(screen.getByText('Tomato Soup')).toBeInTheDocument()
  })

  it('shows a friendly error with retry when the API fails', async () => {
    server.use(
      http.get('/api/recipes', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderPage()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'The server ran into a problem. Please try again later.',
    )
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
