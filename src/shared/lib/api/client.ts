/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import axios from 'axios'
import { toAppError } from './errors'

export const API_BASE_URL = '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Without this a stalled request hangs forever (axios default is no timeout),
  // so a mutation never settles and any UI gated on its pending state locks up.
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Where the auth token attaches once auth lands.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Extend for 401 refresh when auth lands.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toAppError(error)),
)

// Placeholder until the auth feature exists.
function getAuthToken(): string | null {
  return null
}
