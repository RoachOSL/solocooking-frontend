/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { Link, Outlet } from 'react-router'

export default function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 p-4">
          <Link to="/" className="text-lg font-bold">
            SoloCooking
          </Link>
          <Link
            to="/recipes"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Recipes
          </Link>
          <Link
            to="/ingredients"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ingredients
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
