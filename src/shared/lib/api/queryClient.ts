/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Per-mutation copy, read in the global handlers below. `successMessage` opts a
// mutation into a confirmation toast; `toastError: false` suppresses the global
// error toast where the trigger already renders the error in place (a form).
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successMessage?: string
      toastError?: boolean
    }
  }
}

// The single place every mutation's outcome is reported. Cache-level callbacks
// fire regardless of whether the triggering component is still mounted, which a
// callback passed to `.mutate(_, { onError })` does not — so a dialog that
// closes mid-request never drops its result on the floor. A factory so tests
// get their own client (and cache) instead of sharing the app singleton.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.toastError === false) {
          return
        }
        // Errors are AppError from the response interceptor, message ready.
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
