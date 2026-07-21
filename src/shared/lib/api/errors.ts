/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { isAxiosError } from 'axios'

export class AppError extends Error {
  readonly status?: number
  readonly type?: string

  constructor(message: string, status?: number, type?: string) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.type = type
  }
}

// Both entries below are 409; the ProblemDetail `type` URN is what tells them
// apart. Matching on `detail` prose would break on a wording change, and
// matching on the call site goes stale once an operation gains a second reason
// to conflict.
const MESSAGE_BY_TYPE: Record<string, string> = {
  'urn:solocooking:error:ingredient-already-exists':
    'That name is already taken.',
  'urn:solocooking:error:ingredient-in-use':
    'A recipe uses this ingredient, so it cannot be deleted.',
}

function problemType(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined
  }
  const { type } = data as { type?: unknown }
  return typeof type === 'string' ? type : undefined
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      return new AppError(
        'Cannot reach the server. Check your connection and try again.',
      )
    }

    const { status, data } = error.response
    const type = problemType(data)
    const known = type ? MESSAGE_BY_TYPE[type] : undefined
    if (known) {
      return new AppError(known, status, type)
    }

    if (status === 404) {
      return new AppError('The requested resource was not found.', status, type)
    }
    if (status === 409) {
      return new AppError(
        'That change conflicts with what the server already holds.',
        status,
        type,
      )
    }
    if (status >= 500) {
      return new AppError(
        'The server ran into a problem. Please try again later.',
        status,
        type,
      )
    }
    return new AppError('The request could not be completed.', status, type)
  }

  return new AppError('Something went wrong. Please try again.')
}
