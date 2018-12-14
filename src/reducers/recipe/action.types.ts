import { Action as BaseAction } from 'redux';
import { INewRecipe, IRecipe } from '../../server/interfaces';

/**
 * Add new recipes to the state
 */
export type AddItems = BaseAction<ActionNames.ADD_ITEMS> & {
    items: IRecipe[];
}

/**
 * Remove a recipe from the state
 */
export type RemoveItem = BaseAction<ActionNames.REMOVE_ITEM> & {
    id: string;
}

/**
 * Update individual properties of an existing recipe in the state
 */
export type UpdateItem = BaseAction<ActionNames.UPDATE_ITEM> & {
    id: string;
    update: Partial<INewRecipe>;
}

export type Action = AddItems | RemoveItem | UpdateItem;

export enum ActionNames {
    ADD_ITEMS = 'ADD_RECIPES',
    REMOVE_ITEM = 'REMOVE_RECIPE',
    UPDATE_ITEM = 'UPDATE_RECIPE'
}