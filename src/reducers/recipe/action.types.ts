import { Action as BaseAction } from 'redux';
import { IRecipe } from '../../server/interfaces';

/**
 * Add new recipes to the state
 */
export type AddItems = BaseAction<ActionNames.ADD_ITEMS> & {
    items: IRecipe[];
}

/**
 * Add a new recipe to the state
 */
export type AddItem = BaseAction<ActionNames.ADD_ITEM> & {
    item: IRecipe;
}

/**
 * Remove a recipe from the state
 */
export type RemoveItem = BaseAction<ActionNames.REMOVE_ITEM> & {
    id: string;
}

export type Action = AddItems | AddItem | RemoveItem;

export enum ActionNames {
    ADD_ITEM = 'ADD_RECIPE',
    ADD_ITEMS = 'ADD_RECIPES',
    REMOVE_ITEM = 'REMOVE_RECIPE'
}