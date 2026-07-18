/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import type { CreateClientConfig } from './__generated__/client.gen'
import { apiClient } from './client'

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  axios: apiClient,
})
