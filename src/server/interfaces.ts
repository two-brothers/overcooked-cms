export interface IPagedFood {
    food: IFood[];
    last_page: boolean;
}

export interface INewFood {
    name: {
        singular: string;
        plural: string;
    }
    conversions: IUnitConversion[];
}

export type IFood = INewFood & {
    id: string;
}

export interface IUnitConversion {
    unit_id: number;
    ratio: number;
}

export interface IPagedRecipes {
    recipes: IRecipe[];
    last_page: boolean;
}

export interface INewRecipe {
    title: string;
    serves?: number;
    makes?: number;
    prep_time: number;
    cook_time: number;
    image_url: string;
    ingredient_sections: IIngredientSection[];
    method: string[];
    reference_url: string;
}

export type IRecipe = INewRecipe & {
    id: string;
    last_updated: number;
}

export interface IIngredientSection {
    heading?: string;
    ingredients: IIngredient[];
}

export type IIngredient = IQuantifiedIngredient | IFreeTextIngredient;

export interface IQuantifiedIngredient {
    ingredient_type: 'Quantified';
    amount: number;
    unit_ids: number[];
    food_id: string;
    additional_desc?: string;
}

export interface IFreeTextIngredient {
    ingredient_type: 'FreeText';
    description: string;
}