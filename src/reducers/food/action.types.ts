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

export type Action = UpdateItems | AddItem;

export enum ActionNames {
    UPDATE_ITEMS = 'UPDATE_FOOD_ITEMS',
    ADD_ITEM = 'ADD_FOOD_ITEM'
}