import { Action as BaseAction } from 'redux'
import { IFood, INewFood } from '../../server/interfaces'

/**
 * Add new food items to the state, and replace existing ones with the updated value
 */
export type ReplaceItems = BaseAction<ActionNames.REPLACE_ITEMS> & {
    items: IFood[]
}

/**
 * Remove a food item from the state
 */
export type RemoveItem = BaseAction<ActionNames.REMOVE_ITEM> & {
    id: string
}

/**
 * Update individual properties of an existing food item in the state
 */
export type UpdateItem = BaseAction<ActionNames.UPDATE_ITEM> & {
    id: string
    update: Partial<INewFood>
}

export type Action = ReplaceItems | RemoveItem | UpdateItem

export enum ActionNames {
    REPLACE_ITEMS = 'REPLACE_FOOD_ITEMS',
    REMOVE_ITEM = 'REMOVE_FOOD_ITEM',
    UPDATE_ITEM = 'UPDATE_FOOD_ITEM'
}