/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import type { CreateClientConfig } from './__generated__/client.gen'
import { apiClient } from './client'

// Pins the relative baseURL regardless of the spec's server URL. An absolute
// URL here would bypass the Vite dev proxy and MSW's relative path matching.
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  axios: apiClient,
  baseURL: '/api',
})
