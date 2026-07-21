/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useParams } from 'react-router'
import { PageSection } from '@/shared/components/PageSection'

export function RecipeDetailPage() {
  const { id } = useParams()
  return (
    <PageSection>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight">
        Recipe detail
      </h1>
      <p className="text-muted-foreground">
        Detail view for recipe <code>{id}</code> — coming in a later iteration.
      </p>
    </PageSection>
  )
}
