/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { defineConfig } from '@hey-api/openapi-ts'

// Generates from the committed spec snapshot (openapi.json) so codegen works
// without a running backend. Refresh the snapshot with `npm run spec:update`
// (requires the backend live at http://localhost:8080/api).
export default defineConfig({
  input: 'openapi.json',
  output: 'src/shared/lib/api/__generated__',
  plugins: ['@hey-api/client-axios', '@tanstack/react-query'],
})
