/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
