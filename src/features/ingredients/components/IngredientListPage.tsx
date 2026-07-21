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
import { useIngredientSearch, useIngredients } from '../hooks/useIngredients'
import { normalizeName } from '../normalizeName'
import { IngredientFormDialog } from './IngredientFormDialog'

const PAGE_SIZE = 24

// Shared with the placeholders below, so they keep predicting where cards land.
const CARD_GRID =
  'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

// Never more than a request can return, or the grid is guaranteed to collapse.
const SKELETON_COUNT = PAGE_SIZE

// How many placeholders fill a screen depends on columns, which CSS decides —
// so CSS decides the count too, by hiding the ones past each breakpoint's
// screenful. A full page is six rows on a desktop and twenty-four on a phone.
function skeletonVisibility(index: number) {
  if (index < 6) {
    return ''
  }
  if (index < 8) {
    return 'hidden sm:flex'
  }
  if (index < 12) {
    return 'hidden lg:flex'
  }
  return 'hidden xl:flex'
}

// Bars of one width read as a table, which is not what arrives. Cycled, so the
// count above stays the only number to change.
const SKELETON_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28', 'w-36', 'w-24']

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
  const list = useIngredients({ page, size: PAGE_SIZE })
  const search = useIngredientSearch(debouncedTerm, { page, size: PAGE_SIZE })
  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    searching ? search : list

  const normalized = normalizeName(term)
  // Offer the name only once the search that would have found it has settled,
  // so the button cannot suggest adding something already on screen.
  const canAdd =
    normalized.length > 0 &&
    normalizeName(debouncedTerm) === normalized &&
    !search.isFetching &&
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
        {/* The one strong call to action on the page: the search box beside it
            is a surface, not a competing button. */}
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
                    {/* Holds the shape a photo will take. The catalog stores
                        only a name today, so the frame stays reserved rather
                        than reflowing the grid once photos land. */}
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
