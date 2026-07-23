/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useState } from 'react'
import { ImagePlus, Pencil, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageSection } from '@/shared/components/PageSection'
import { SearchField } from '@/shared/components/SearchField'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import { cn } from '@/shared/lib/utils'
import type { IngredientDto } from '@/shared/lib/api/__generated__'
import {
  CARD_GRID,
  PAGE_SIZE,
  SKELETON_COUNT,
  SKELETON_WIDTHS,
  skeletonVisibility,
} from '../catalogGrid'
import { useIngredientCatalog } from '../hooks/useIngredients'
import { normalizeName } from '../normalizeName'
import { IngredientFormDialog } from './IngredientFormDialog'

function CatalogSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading ingredients…</span>
      <ul aria-hidden className={CARD_GRID}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-3 rounded-lg border bg-card p-2 shadow-card',
              skeletonVisibility(index),
            )}
          >
            <Skeleton className="size-12 shrink-0" />
            <Skeleton
              className={`h-4 ${SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]}`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function IngredientListPage() {
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(0)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<IngredientDto | null>(null)
  const debouncedTerm = useDebouncedValue(term)

  const searching = debouncedTerm.trim().length > 0
  const catalog = useIngredientCatalog(debouncedTerm, { page, size: PAGE_SIZE })
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isPlaceholderData,
    isSuccess,
    isFetching,
  } = catalog

  // Optimistic delete can leave the page past the end; correct during render
  // so the empty page never commits.
  if (!isPlaceholderData && data) {
    const lastPage = Math.max(0, data.page.totalPages - 1)
    if (page > lastPage) {
      setPage(lastPage)
    }
  }

  const normalized = normalizeName(term)
  // A failed or in-flight search is not proof the name is free; the 409 on
  // create stays the final word.
  const canAdd =
    searching &&
    normalized.length > 0 &&
    normalizeName(debouncedTerm) === normalized &&
    isSuccess &&
    !isFetching &&
    !data?.content.some((ingredient) => ingredient.name === normalized)

  function handleTermChange(value: string) {
    setTerm(value)
    setPage(0)
  }

  return (
    <PageSection>
      <h1 className="text-3xl font-semibold tracking-tight">Ingredients</h1>
      <p className="mt-2 text-muted-foreground">
        Everything the pantry knows about. Search it, or add what is missing.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField
          value={term}
          onChange={(event) => handleTermChange(event.target.value)}
          maxLength={255}
          aria-label="Search or add an ingredient"
          placeholder="Search or add an ingredient…"
          className="min-w-64 flex-1"
        />
        {/* The page's one strong call to action. */}
        <Button className="h-12 px-6" onClick={() => setCreating(true)}>
          <Plus aria-hidden className="size-4" />
          {canAdd ? `Add ${normalized}` : 'New ingredient'}
        </Button>
      </div>

      <div className="mt-8">
        {isPending && <CatalogSkeleton />}

        {isError && (
          <div role="alert" className="space-y-3">
            <p className="text-destructive">{error.message}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {data && data.content.length === 0 && (
          <p className="text-muted-foreground">
            {searching
              ? `Nothing matches “${debouncedTerm.trim()}”.`
              : 'The catalog is empty.'}
          </p>
        )}

        {data && data.content.length > 0 && (
          <>
            {/* Dimmed while stale: still readable, visibly not the answer yet. */}
            <ul
              className={cn(
                CARD_GRID,
                'transition-opacity',
                isPlaceholderData && 'opacity-60',
              )}
            >
              {data.content.map((ingredient) => (
                <li key={ingredient.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(ingredient)}
                    className="group flex w-full items-center gap-3 rounded-lg border bg-card p-2 text-left shadow-card transition-colors hover:border-ring hover:bg-accent"
                  >
                    {/* Frame reserved for the photo the catalog cannot store
                        yet, so the grid will not reflow once it can. */}
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <ImagePlus
                        aria-hidden
                        className="size-4 text-muted-foreground/70"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize">
                      {ingredient.name}
                    </span>
                    <Pencil
                      aria-hidden
                      className="mr-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page.number + 1} of{' '}
                {Math.max(1, data.page.totalPages)}
              </span>
              <Button
                variant="outline"
                disabled={page >= data.page.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      <IngredientFormDialog
        open={creating}
        onOpenChange={setCreating}
        initialName={canAdd ? normalized : ''}
      />
      <IngredientFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        ingredient={editing ?? undefined}
      />
    </PageSection>
  )
}
