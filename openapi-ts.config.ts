/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { defineConfig } from '@hey-api/openapi-ts'

// Reads the committed spec snapshot so codegen works without a running backend.
export default defineConfig({
  input: 'openapi.json',
  output: 'src/shared/lib/api/__generated__',
  plugins: ['@hey-api/client-axios', '@tanstack/react-query'],
})
