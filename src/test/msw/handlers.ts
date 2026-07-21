/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { http, HttpResponse } from 'msw'
import type {
  IngredientDto,
  PageResponseIngredientDto,
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

// Lowercase throughout, the way IngredientMapper.normalize stores them.
const seededIngredients: IngredientDto[] = [
  { id: '33333333-3333-3333-3333-333333333333', name: 'black pepper' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'bell pepper' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'olive oil' },
]

// POST mutates this list so a create shows up in the next list read. Reset
// between tests from src/test/setup.ts.
let ingredients: IngredientDto[] = [...seededIngredients]

export function resetIngredients() {
  ingredients = [...seededIngredients]
}

function pageOf(content: IngredientDto[]): PageResponseIngredientDto {
  return {
    content,
    page: {
      number: 0,
      size: 24,
      totalElements: content.length,
      totalPages: 1,
    },
  }
}

export const handlers = [
  http.get('/api/recipes', () => {
    const body: PageResponseRecipeSummaryDto = {
      content: recipes,
      page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
    }
    return HttpResponse.json(body)
  }),

  http.get('/api/ingredients', () => HttpResponse.json(pageOf(ingredients))),

  http.get('/api/ingredients/search', ({ request }) => {
    const name = new URL(request.url).searchParams.get('name') ?? ''
    const matches = ingredients.filter((ingredient) =>
      ingredient.name.includes(name.trim().toLowerCase()),
    )
    return HttpResponse.json(pageOf(matches))
  }),

  http.post('/api/ingredients', async ({ request }) => {
    const { name } = (await request.json()) as { name: string }
    if (ingredients.some((ingredient) => ingredient.name === name)) {
      return HttpResponse.json(
        {
          type: 'urn:solocooking:error:ingredient-already-exists',
          detail: `Ingredient [${name}] already exists.`,
        },
        { status: 409 },
      )
    }
    const created: IngredientDto = { id: `generated-${name}`, name }
    ingredients = [...ingredients, created]
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch('/api/ingredients/:ingredientId', async ({ params, request }) => {
    const { name } = (await request.json()) as { name: string }
    const { ingredientId } = params
    if (
      ingredients.some(
        (ingredient) =>
          ingredient.name === name && ingredient.id !== ingredientId,
      )
    ) {
      return HttpResponse.json(
        {
          type: 'urn:solocooking:error:ingredient-already-exists',
          detail: `Ingredient [${name}] already exists.`,
        },
        { status: 409 },
      )
    }
    const updated: IngredientDto = { id: String(ingredientId), name }
    ingredients = ingredients.map((ingredient) =>
      ingredient.id === ingredientId ? updated : ingredient,
    )
    return HttpResponse.json(updated)
  }),

  http.delete('/api/ingredients/:ingredientId', ({ params }) => {
    ingredients = ingredients.filter(
      (ingredient) => ingredient.id !== params.ingredientId,
    )
    return new HttpResponse(null, { status: 204 })
  }),
]
