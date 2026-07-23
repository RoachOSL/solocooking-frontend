/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  createIngredientMutation,
  deleteIngredientMutation,
  getIngredientsOptions,
  searchIngredientsOptions,
  updateIngredientMutation,
} from '@/shared/lib/api/__generated__/@tanstack/react-query.gen'
import type {
  IngredientDto,
  PageResponseIngredientDto,
} from '@/shared/lib/api/__generated__'

type IngredientListData = { content: IngredientDto[] }
type CatalogParams = { page?: number; size?: number }

// Any write stales the catalog across every page and term. Matching on the
// generated `_id` covers both endpoints without restating each key's params.
function isIngredientList(queryKey: QueryKey) {
  const { _id: id } = queryKey[0] as { _id?: string }
  return id === 'getIngredients' || id === 'searchIngredients'
}

const KEEP_LIST_ON_SCREEN = { placeholderData: keepPreviousData }

// One observer: browse when the term is empty, search otherwise — one active
// request, and keepPreviousData bridges the switch without a skeleton flash.
export function useIngredientCatalog(term: string, params: CatalogParams = {}) {
  const trimmed = term.trim()
  // The two generated builders carry different query-key types; unify them so a
  // single observer can hold either. Same data shape, so the key is opaque here.
  const options = (
    trimmed
      ? searchIngredientsOptions({ query: { name: trimmed, ...params } })
      : getIngredientsOptions({ query: params })
  ) as UseQueryOptions<PageResponseIngredientDto>
  return useQuery({ ...options, ...KEEP_LIST_ON_SCREEN })
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
  return useMutation({
    ...createIngredientMutation(),
    // Form shows the error inline, so suppress the global error toast.
    meta: { successMessage: 'Ingredient added', toastError: false },
    onSuccess: invalidate,
  })
}

export function useUpdateIngredient() {
  const invalidate = useInvalidateIngredients()
  return useMutation({
    ...updateIngredientMutation(),
    meta: { successMessage: 'Ingredient updated', toastError: false },
    onSuccess: invalidate,
  })
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateIngredients()
  const listFilter = {
    predicate: (query: Query) => isIngredientList(query.queryKey),
  }
  return useMutation({
    ...deleteIngredientMutation(),
    meta: { successMessage: 'Ingredient deleted' },
    // Optimistically drop the row; onError restores the snapshot if the server
    // refuses (e.g. the ingredient is used by a recipe).
    onMutate: async (variables) => {
      const { ingredientId } = variables.path
      await queryClient.cancelQueries(listFilter)
      const snapshots =
        queryClient.getQueriesData<IngredientListData>(listFilter)
      for (const [key, data] of snapshots) {
        if (!data) {
          continue
        }
        queryClient.setQueryData<IngredientListData>(key, {
          ...data,
          content: data.content.filter((item) => item.id !== ingredientId),
        })
      }
      return { snapshots }
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: invalidate,
  })
}
