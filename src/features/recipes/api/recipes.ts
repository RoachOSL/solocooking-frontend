/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { apiClient } from '@/shared/lib/api/client'
import type { PageResponse } from '@/shared/types/page'
import type { Recipe, RecipeSummary } from '../types'

export interface GetRecipesParams {
  page?: number
  size?: number
}

export const recipeKeys = {
  all: ['recipes'] as const,
  list: (params: GetRecipesParams) => ['recipes', 'list', params] as const,
  detail: (id: string) => ['recipes', 'detail', id] as const,
}

export async function getRecipes(
  params: GetRecipesParams = {},
): Promise<PageResponse<RecipeSummary>> {
  const { data } = await apiClient.get<PageResponse<RecipeSummary>>(
    '/recipes',
    {
      params,
    },
  )
  return data
}

export async function getRecipe(id: string): Promise<Recipe> {
  const { data } = await apiClient.get<Recipe>(`/recipes/${id}`)
  return data
}
