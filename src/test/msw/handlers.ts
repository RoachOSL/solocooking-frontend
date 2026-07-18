import { http, HttpResponse } from 'msw'
import type { PageResponse } from '@/shared/types/page'
import type { RecipeSummary } from '@/features/recipes'

const recipes: RecipeSummary[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Pancakes',
    imageUrl: null,
    description: 'Fluffy breakfast pancakes',
    updatedAt: '2026-07-01T10:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Tomato Soup',
    imageUrl: null,
    description: 'Simple and warming',
    updatedAt: '2026-07-02T10:00:00Z',
    createdAt: '2026-07-02T10:00:00Z',
  },
]

export const handlers = [
  http.get('/api/recipes', () => {
    const body: PageResponse<RecipeSummary> = {
      content: recipes,
      page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
    }
    return HttpResponse.json(body)
  }),
]
