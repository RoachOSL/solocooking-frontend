/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useQuery } from '@tanstack/react-query'
import { getRecipesOptions } from '@/shared/lib/api/__generated__/@tanstack/react-query.gen'
import type { GetRecipesData } from '@/shared/lib/api/__generated__'

export type GetRecipesParams = NonNullable<GetRecipesData['query']>

export function useRecipes(params: GetRecipesParams = {}) {
  return useQuery(getRecipesOptions({ query: params }))
}
