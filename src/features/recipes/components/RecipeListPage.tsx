/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { useState } from 'react'
import { Link } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { PageSection } from '@/shared/components/PageSection'
import { useRecipes } from '../hooks/useRecipes'

const PAGE_SIZE = 20

export function RecipeListPage() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, refetch } = useRecipes({
    page,
    size: PAGE_SIZE,
  })

  return (
    <PageSection>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Recipes</h1>

      {isPending && <p className="text-muted-foreground">Loading recipes…</p>}

      {isError && (
        <div role="alert" className="space-y-3">
          <p className="text-destructive">{error.message}</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && data.content.length === 0 && (
        <p className="text-muted-foreground">No recipes yet.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.content.map((recipe) => (
              <li key={recipe.id}>
                <Link to={`/recipes/${recipe.id}`} className="block h-full">
                  <Card className="h-full transition-colors hover:border-ring">
                    {recipe.imageUrl && (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="h-40 w-full rounded-t-xl object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle>{recipe.name}</CardTitle>
                      {recipe.description && (
                        <CardDescription className="line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      Updated {new Date(recipe.updatedAt).toLocaleDateString()}
                    </CardContent>
                  </Card>
                </Link>
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
              Page {data.page.number + 1} of {Math.max(1, data.page.totalPages)}
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
    </PageSection>
  )
}
