import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
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
})
