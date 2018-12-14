import { Action as BaseAction } from 'redux';
import { IRecipe } from '../../server/interfaces';

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

export type Action = AddItems | RemoveItem;

export enum ActionNames {
    ADD_ITEMS = 'ADD_RECIPES',
    REMOVE_ITEM = 'REMOVE_RECIPE'
}