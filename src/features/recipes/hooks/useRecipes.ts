/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useQuery } from '@tanstack/react-query'
import { getRecipes, recipeKeys, type GetRecipesParams } from '../api/recipes'

export function useRecipes(params: GetRecipesParams = {}) {
  return useQuery({
    queryKey: recipeKeys.list(params),
    queryFn: () => getRecipes(params),
  })
}
