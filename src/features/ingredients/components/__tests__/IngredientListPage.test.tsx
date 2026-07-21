/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { IngredientListPage } from '../IngredientListPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <IngredientListPage />
    </QueryClientProvider>,
  )
}

function typeSearch(value: string) {
  fireEvent.change(
    screen.getByRole('searchbox', { name: 'Search or add an ingredient' }),
    { target: { value } },
  )
}

describe('IngredientListPage', () => {
  it('renders the catalog from the API', async () => {
    renderPage()

    expect(await screen.findByText('black pepper')).toBeInTheDocument()
    expect(screen.getByText('olive oil')).toBeInTheDocument()
  })

  it('narrows the catalog to the search term', async () => {
    renderPage()
    await screen.findByText('black pepper')

    typeSearch('pepper')

    expect(await screen.findByText('bell pepper')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('olive oil')).not.toBeInTheDocument(),
    )
  })

  // Without keepPreviousData every search term empties the list and shows the
  // skeleton, so results vanish while they are being read. Removing that option
  // has no other visible symptom.
  it('keeps the previous results on screen while the next search loads', async () => {
    renderPage()
    await screen.findByText('black pepper')

    typeSearch('pepper')
    // 'olive oil' leaving is what proves the search ran — both peppers are also
    // in the unfiltered catalog, so finding one would pass before it did.
    await waitFor(() =>
      expect(screen.queryByText('olive oil')).not.toBeInTheDocument(),
    )

    let searchStarted = false
    server.use(
      http.get('/api/ingredients/search', async () => {
        searchStarted = true
        await delay('infinite')
        return HttpResponse.json(null)
      }),
    )

    typeSearch('bell')
    await waitFor(() => expect(searchStarted).toBe(true))

    // 'black pepper' does not match 'bell': it is on screen only because the
    // previous term's results are being held.
    expect(screen.getByText('black pepper')).toBeInTheDocument()
    expect(screen.queryByText('Loading ingredients…')).not.toBeInTheDocument()
  })

  it('adds a name the catalog does not have yet, lowercased', async () => {
    renderPage()
    await screen.findByText('black pepper')

    typeSearch('Smoked Paprika')
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add smoked paprika' }),
    )

    // The dialog opens carrying the searched name.
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'New ingredient',
    )
    expect(screen.getByLabelText('Name')).toHaveValue('smoked paprika')

    fireEvent.click(screen.getByRole('button', { name: 'Add ingredient' }))

    expect(await screen.findByText('smoked paprika')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('reports a name the catalog already holds', async () => {
    server.use(
      http.post('/api/ingredients', () =>
        HttpResponse.json(
          {
            type: 'urn:solocooking:error:ingredient-already-exists',
            detail: 'Ingredient [sea salt] already exists.',
          },
          { status: 409 },
        ),
      ),
    )
    renderPage()
    await screen.findByText('black pepper')

    typeSearch('Sea Salt')
    fireEvent.click(await screen.findByRole('button', { name: 'Add sea salt' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add ingredient' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That name is already taken.',
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renames an ingredient from its tile', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'olive oil' }))
    await screen.findByRole('dialog')

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Extra Virgin Olive Oil' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('extra virgin olive oil'),
    ).toBeInTheDocument()
  })

  it('deletes an ingredient after a confirmation step', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'olive oil' }))
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))

    await waitFor(() =>
      expect(screen.queryByText('olive oil')).not.toBeInTheDocument(),
    )
  })

  it('explains a delete blocked by a recipe rather than reusing the name conflict copy', async () => {
    server.use(
      http.delete('/api/ingredients/:ingredientId', () =>
        HttpResponse.json(
          {
            type: 'urn:solocooking:error:ingredient-in-use',
            detail:
              'Ingredient cannot be deleted because it is used by a recipe.',
          },
          { status: 409 },
        ),
      ),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'olive oil' }))
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A recipe uses this ingredient, so it cannot be deleted.',
    )
  })

  // A conflict the frontend has no URN for must not borrow another one's copy.
  it('falls back to neutral wording for an unrecognized conflict', async () => {
    server.use(
      http.delete('/api/ingredients/:ingredientId', () =>
        HttpResponse.json(
          { type: 'urn:solocooking:error:something-new', detail: 'nope' },
          { status: 409 },
        ),
      ),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'olive oil' }))
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That change conflicts with what the server already holds.',
    )
  })

  it('keeps the photo and unit fields marked as not yet stored', async () => {
    renderPage()
    await screen.findByText('black pepper')

    fireEvent.click(screen.getByRole('button', { name: 'New ingredient' }))
    await screen.findByRole('dialog')

    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getAllByText('Soon')).toHaveLength(2)
  })

  it('shows a friendly error with retry when the catalog fails to load', async () => {
    server.use(
      http.get('/api/ingredients', () =>
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
