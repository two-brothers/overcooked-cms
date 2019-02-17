export interface IPagedFood {
    food: IFood[]
    lastPage: boolean
}

export interface INewFood {
    name: {
        singular: string
        plural: string
    }
    conversions: IUnitConversion[]
}

export type IFood = INewFood & {
    id: string
}

export interface IUnitConversion {
    unitId: number
    ratio: number
}

export interface IPagedRecipes {
    recipes: IRecipe[]
    food: IFood[]
    lastPage: boolean
}

export interface IAugmentedRecipe {
    recipe: IRecipe
    food: IFood[]
}

export interface INewRecipe {
    title: string
    serves?: number
    makes?: number
    prepTime: number
    cookTime: number
    imageUrl: string
    ingredientSections: IIngredientSection[]
    method: string[]
    referenceUrl: string
}

export type IRecipe = INewRecipe & {
    id: string
    lastUpdated: number
}

export interface IIngredientSection {
    heading?: string
    ingredients: IIngredient[]
}

export type IIngredient = IQuantifiedIngredient | IFreeTextIngredient

export enum IngredientType {
    Quantified = 0,
    FreeText = 1
}

export interface IQuantifiedIngredient {
    ingredientType: IngredientType.Quantified
    amount: number
    unitIds: number[]
    foodId: string
    additionalDesc?: string
}

export interface IFreeTextIngredient {
    ingredientType: IngredientType.FreeText
    description: string
}
