/*
 * Copyright (c) 2026 dev.soloprogramming
 */

// Mirrors IngredientMapper.normalize on the backend, so the UI can show what a
// name will become and tell an exact match from a partial one.
export function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}
