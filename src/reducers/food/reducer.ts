import { IFood } from '../../server/interfaces'
import { Action, ActionNames } from './action.types'

export interface IState {
    [id: string]: IFood
}

/**
 * Handle the food actions as follows
 *  - REPLACE_ITEMS:  add new food items to the state, overwriting existing ones with the same IDs
 *  - REMOVE_ITEM: remove the food item from the state, if it exists
 * @param state the state before the action is applied
 * @param action the action to apply
 * @returns the new state after the action has been applied
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.REPLACE_ITEMS:
            return Object.assign({}, state, action.items)
        case ActionNames.REMOVE_ITEM:
            const updated = Object.assign({}, state)
            delete updated[action.id]
            return updated
        default:
            return state
    }
}

const initialState: IState = {}
