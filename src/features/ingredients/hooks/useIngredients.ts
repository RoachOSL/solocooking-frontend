/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import {
  createIngredientMutation,
  deleteIngredientMutation,
  getIngredientsOptions,
  searchIngredientsOptions,
  updateIngredientMutation,
} from '@/shared/lib/api/__generated__/@tanstack/react-query.gen'
import type {
  GetIngredientsData,
  SearchIngredientsData,
} from '@/shared/lib/api/__generated__'

export type GetIngredientsParams = NonNullable<GetIngredientsData['query']>
export type SearchIngredientsParams = Omit<
  SearchIngredientsData['query'],
  'name'
>

// Any write stales both lists across every page and term. Matching on the
// generated `_id` covers them without restating each key's params.
function isIngredientList(queryKey: QueryKey) {
  const { _id: id } = queryKey[0] as { _id?: string }
  return id === 'getIngredients' || id === 'searchIngredients'
}

// Page and term are part of the query key, so without this every keystroke
// empties the list while it is being read.
const KEEP_LIST_ON_SCREEN = { placeholderData: keepPreviousData }

export function useIngredients(params: GetIngredientsParams = {}) {
  return useQuery({
    ...getIngredientsOptions({ query: params }),
    ...KEEP_LIST_ON_SCREEN,
  })
}

export function useIngredientSearch(
  name: string,
  params: SearchIngredientsParams = {},
) {
  const term = name.trim()
  return useQuery({
    ...searchIngredientsOptions({ query: { name: term, ...params } }),
    ...KEEP_LIST_ON_SCREEN,
    // The backend rejects a blank name with 400, so an empty box must not ask.
    enabled: term.length > 0,
  })
}

function useInvalidateIngredients() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => isIngredientList(query.queryKey),
    })
}

export function useCreateIngredient() {
  const invalidate = useInvalidateIngredients()
  return useMutation({ ...createIngredientMutation(), onSuccess: invalidate })
}

export function useUpdateIngredient() {
  const invalidate = useInvalidateIngredients()
  return useMutation({ ...updateIngredientMutation(), onSuccess: invalidate })
}

export function useDeleteIngredient() {
  const invalidate = useInvalidateIngredients()
  return useMutation({ ...deleteIngredientMutation(), onSuccess: invalidate })
}
