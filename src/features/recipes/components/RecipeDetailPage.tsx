/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useParams } from 'react-router'

export function RecipeDetailPage() {
  const { id } = useParams()
  return (
    <section className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        Recipe detail
      </h1>
      <p className="text-muted-foreground">
        Detail view for recipe <code>{id}</code> — coming in a later iteration.
      </p>
    </section>
  )
}
