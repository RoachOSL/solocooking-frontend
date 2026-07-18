import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import licenseHeader from 'eslint-plugin-license-header'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

const LICENSE_HEADER = [
  '/*',
  ' * Copyright (c) 2026 dev.soloprogramming',
  ' */',
]

export default defineConfig([
  globalIgnores(['dist', 'src/shared/lib/api/__generated__']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'license-header': licenseHeader,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'license-header/header': ['error', LICENSE_HEADER],
    },
  },
  {
    // shadcn/ui primitives co-locate component + variants by design.
    files: ['src/shared/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
