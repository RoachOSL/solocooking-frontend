import axios, { AxiosError } from 'axios'

// Single axios instance for the whole app. Base URL is /api (Vite dev proxy
// points it at the Spring Boot backend on :8080).
//
// NOTE: once the backend is running, `npm run generate` produces the official
// Hey API client into ./__generated__ (configured with the axios plugin so it
// reuses this instance). This module is the interim, same-shape stand-in so the
// app builds and runs now.

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
