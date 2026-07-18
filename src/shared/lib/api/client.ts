/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import axios, { AxiosError } from 'axios'

export const API_BASE_URL = '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
})

// Request interceptor — single place to attach the auth token once auth lands.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — normalize errors. Extend later for 401 refresh.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
)

// Placeholder until the auth feature exists.
function getAuthToken(): string | null {
  return null
}
