import { Action as BaseAction } from 'redux';
import { IRecipe } from '../../server/interfaces';

/**
 * Add a new recipe to the state
 */
export type AddItem = BaseAction<ActionNames.ADD_ITEM> & {
    item: IRecipe;
}

export type Action = AddItem;

export enum ActionNames {
    ADD_ITEM = 'ADD_RECIPE_ITEM'
}