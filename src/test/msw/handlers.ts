/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { http, HttpResponse } from 'msw'
import type {
  PageResponseRecipeSummaryDto,
  RecipeSummaryDto,
} from '@/shared/lib/api/__generated__'

const recipes: RecipeSummaryDto[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Pancakes',
    imageUrl: 'https://example.com/pancakes.jpg',
    description: 'Fluffy breakfast pancakes',
    updatedAt: '2026-07-01T10:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Tomato Soup',
    imageUrl: 'https://example.com/tomato-soup.jpg',
    description: 'Simple and warming',
    updatedAt: '2026-07-02T10:00:00Z',
    createdAt: '2026-07-02T10:00:00Z',
  },
]

export const handlers = [
  http.get('/api/recipes', () => {
    const body: PageResponseRecipeSummaryDto = {
      content: recipes,
      page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
    }
    return HttpResponse.json(body)
  }),
]
