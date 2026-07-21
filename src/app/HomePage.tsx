/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { Link } from 'react-router'
import { BookOpen, Carrot, CookingPot, ScrollText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { PageSection } from '@/shared/components/PageSection'
import { SearchField } from '@/shared/components/SearchField'
import { Badge } from '@/shared/components/ui/badge'

// Everything below the hero renders static data until the backend grows the
// matching endpoints, or the sections get cut.

const mockRecentRecipes = [
  {
    id: '1',
    name: 'Pancakes',
    description: 'Fluffy breakfast pancakes',
    rank: 'B',
  },
  {
    id: '2',
    name: 'Tomato Soup',
    description: 'Simple and warming',
    rank: 'A',
  },
  {
    id: '3',
    name: 'Garlic Naan',
    description: 'Soft flatbread from the pan',
    rank: 'S',
  },
]

function RankBadge({ rank }: { rank: string }) {
  return (
    <span
      title="Difficulty rank"
      className={
        rank === 'S'
          ? 'inline-flex size-8 items-center justify-center rounded-md border-2 border-highlight-foreground/50 text-lg font-black text-highlight-foreground'
          : 'inline-flex size-8 items-center justify-center rounded-md border-2 border-primary/50 text-lg font-black text-primary'
      }
    >
      {rank}
    </span>
  )
}

function SearchPlaceholder() {
  return (
    <SearchField
      disabled
      placeholder="Search recipes…"
      className="mx-auto max-w-lg"
    >
      <Badge className="absolute top-1/2 right-3 -translate-y-1/2">Soon</Badge>
    </SearchField>
  )
}

function DailyQuestCard() {
  return (
    <Card className="relative mx-auto max-w-md overflow-hidden border-primary/60 bg-gradient-to-b from-primary/15 to-card shadow-[0_0_32px_-12px_var(--color-primary),var(--card-shadow)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
      />
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
          <ScrollText aria-hidden className="size-4" />
          Daily quest
        </p>
        <p className="text-2xl font-bold tracking-tight">Cook Tomato Soup</p>
        <p className="text-sm text-muted-foreground">
          Complete today&apos;s quest to keep your streak.
        </p>
        <div className="flex items-center gap-4 text-xs">
          <Badge className="px-2.5 font-semibold">Reward: +50 XP</Badge>
          <span className="text-muted-foreground">Progress 0/1</span>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsRow() {
  return (
    <div className="flex justify-center gap-8 text-sm text-muted-foreground">
      <span className="flex items-center gap-2">
        <BookOpen aria-hidden className="size-4 text-primary" />
        12 recipes
      </span>
      <span className="flex items-center gap-2">
        <Carrot aria-hidden className="size-4 text-primary" />
        34 ingredients
      </span>
    </div>
  )
}

function RecentRecipes() {
  return (
    <div className="text-left">
      <h2 className="mb-4 text-center text-xl font-semibold tracking-tight">
        Recent recipes
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {mockRecentRecipes.map((recipe) => (
          <li key={recipe.id}>
            <Link to="/recipes" className="block h-full">
              <Card className="h-full transition-colors hover:border-ring">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    {recipe.name}
                    <RankBadge rank={recipe.rank} />
                  </CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Updated recently
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HomePage() {
  return (
    <PageSection className="py-16 text-center">
      <CookingPot
        aria-hidden
        className="mx-auto mb-6 size-14 text-brand"
        strokeWidth={1.5}
      />
      <h1 className="mb-4 text-5xl font-semibold tracking-tight sm:text-6xl">
        SoloCooking
      </h1>
      <p className="mx-auto mb-10 max-w-xl text-xl text-muted-foreground">
        Your personal recipe collection and ingredient catalog.
      </p>
      <div className="mb-12 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg" className="h-12 px-8 text-base">
          <Link to="/recipes">Browse recipes</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 px-8 text-base"
        >
          <Link to="/ingredients">Browse ingredients</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-10">
        <SearchPlaceholder />
        <DailyQuestCard />
        <StatsRow />
        <RecentRecipes />
      </div>
    </PageSection>
  )
}
