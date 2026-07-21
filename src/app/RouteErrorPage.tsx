/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { PAGE_CONTAINER } from '@/shared/components/PageSection'
import { cn } from '@/shared/lib/utils'

export function RouteErrorPage() {
  const error = useRouteError()
  // No error means rendered by the `*` catch-all route, i.e. a 404.
  const notFound =
    error === undefined || (isRouteErrorResponse(error) && error.status === 404)

  return (
    <main role="alert" className={cn(PAGE_CONTAINER, 'py-6')}>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mb-6 text-muted-foreground">
        {notFound
          ? 'The page you are looking for does not exist.'
          : 'An unexpected error occurred. Try going back to the home page.'}
      </p>
      <Link to="/" className="underline underline-offset-4">
        Back to home
      </Link>
    </main>
  )
}
