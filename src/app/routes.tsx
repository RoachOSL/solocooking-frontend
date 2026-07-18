/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { createBrowserRouter } from 'react-router'
import App from './App'
import { HomePage } from './HomePage'
import { RecipeListPage, RecipeDetailPage } from '@/features/recipes'
import { IngredientListPage } from '@/features/ingredients'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'recipes', element: <RecipeListPage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'ingredients', element: <IngredientListPage /> },
    ],
  },
])
