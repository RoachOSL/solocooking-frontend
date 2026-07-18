// Mirror of backend recipe DTOs. Replaced by generated types after
// `npm run generate`.

export interface RecipeSummary {
  id: string
  name: string
  imageUrl: string | null
  description: string | null
  updatedAt: string
  createdAt: string
}

export interface RecipeIngredient {
  ingredientId: string
  name: string
  amount: number | null
  unit: string | null
}

export interface RecipeSection {
  id: string
  name: string
  ingredients: RecipeIngredient[]
}

export interface Recipe {
  id: string
  name: string
  imageUrl: string | null
  description: string | null
  sections: RecipeSection[]
  updatedAt: string
  createdAt: string
}
