import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <section className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-4xl font-semibold tracking-tight">
        SoloCooking
      </h1>
      <p className="mb-6 text-muted-foreground">
        Recipes and ingredient catalog.
      </p>
      <Button asChild>
        <Link to="/recipes">Browse recipes</Link>
      </Button>
    </section>
  )
}
