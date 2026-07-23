/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successMessage?: string
      toastError?: boolean
    }
  }
}

// Cache-level callbacks fire even after the triggering component unmounts,
// which `.mutate(_, { onError })` does not — so a closed dialog still reports.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.toastError === false) {
          return
        }
        toast.error(error.message)
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        const message = mutation.meta?.successMessage
        if (message) {
          toast.success(message)
        }
      },
    }),
  })
}

export const queryClient = createQueryClient()
