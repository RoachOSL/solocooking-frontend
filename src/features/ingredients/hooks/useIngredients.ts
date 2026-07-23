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
  IngredientDto,
  SearchIngredientsData,
} from '@/shared/lib/api/__generated__'

// Both list endpoints return a PageResponse; only `content` matters for the
// optimistic removal below, and spreading preserves the rest (page metadata).
type IngredientListData = { content: IngredientDto[] }

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
  return useMutation({
    ...createIngredientMutation(),
    // The dialog form stays open and shows the error inline, so a global error
    // toast would double it; success closes the form and confirms via toast.
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
    // Delete closes the dialog at once, so its only failure surface is a toast.
    meta: { successMessage: 'Ingredient deleted' },
    // Drop the row from every cached list immediately; restore from the
    // snapshot if the server refuses (e.g. the ingredient is used by a recipe).
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
    // Reconcile page counts the optimistic filter did not recompute.
    onSettled: invalidate,
  })
}
