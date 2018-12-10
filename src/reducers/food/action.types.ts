import { Action as BaseAction } from 'redux';
import { IFood } from '../../server/interfaces';

/**
 * Add new food items to the state, and replace existing ones with the updated value
 */
export type UpdateItems = BaseAction<ActionNames.UPDATE_ITEMS> & {
    items: IFood[];
};

export type Action = UpdateItems;

export enum ActionNames {
    UPDATE_ITEMS  = 'UPDATE_FOOD_ITEMS'
}