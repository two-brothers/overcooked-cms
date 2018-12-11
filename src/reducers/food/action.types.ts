import { Action as BaseAction } from 'redux';
import { IFood } from '../../server/interfaces';

/**
 * Add new food items to the state, and replace existing ones with the updated value
 */
export type UpdateItems = BaseAction<ActionNames.UPDATE_ITEMS> & {
    items: IFood[];
};

/**
 * Add a new food item to the state
 */
export type AddItem = BaseAction<ActionNames.ADD_ITEM> & {
    item: IFood;
}

/**
 * Remove a food item from the state
 */
export type RemoveItem = BaseAction<ActionNames.REMOVE_ITEM> & {
    id: string;
}

export type Action = UpdateItems | AddItem | RemoveItem;

export enum ActionNames {
    UPDATE_ITEMS = 'UPDATE_FOOD_ITEMS',
    ADD_ITEM = 'ADD_FOOD_ITEM',
    REMOVE_ITEM = 'REMOVE_FOOD_ITEM'
}