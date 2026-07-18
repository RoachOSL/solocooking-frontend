/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { isAxiosError } from 'axios'

export class AppError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
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

    const { status } = error.response
    if (status === 404) {
      return new AppError('The requested resource was not found.', status)
    }
    if (status >= 500) {
      return new AppError(
        'The server ran into a problem. Please try again later.',
        status,
      )
    }
    return new AppError('The request could not be completed.', status)
  }

  return new AppError('Something went wrong. Please try again.')
}
