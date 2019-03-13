import { Action as BaseAction } from 'redux'
import { IFood } from '../../server/interfaces'

/**
 * Add new food items to the state, and replace existing ones with the updated value
 */
export type ReplaceItems = BaseAction<ActionNames.REPLACE_ITEMS> & {
    items: { [id: string]: IFood }
}

/**
 * Remove a food item from the state
 */
export type RemoveItem = BaseAction<ActionNames.REMOVE_ITEM> & {
    id: string
}

export type Action = ReplaceItems | RemoveItem

export enum ActionNames {
    REPLACE_ITEMS = 'REPLACE_FOOD_ITEMS',
    REMOVE_ITEM = 'REMOVE_FOOD_ITEM',
}
