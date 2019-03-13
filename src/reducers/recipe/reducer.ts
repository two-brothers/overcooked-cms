import { IRecipe } from '../../server/interfaces'
import { Action, ActionNames } from './action.types'

export interface IState {
    [id: string]: IRecipe
}

/**
 * Handle the recipe actions as follows
 *  - ADD_ITEMS: append all new recipes to the state
 *  - REMOVE_ITEM: remove the specified recipe from the state, if it exists
 * @param state the list of recipes before the action is applied
 * @param action the action to apply
 * @returns the list of recipes after the action has been applied
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.REPLACE_ITEMS:
            const updates = {}
            action.items.map(item => {
                updates[item.id] = item
            })
            return Object.assign({}, state, updates)
        case ActionNames.REMOVE_ITEM:
            const updated = Object.assign({}, state)
            delete updated[action.id]
            return updated
        default:
            return state
    }
}

const initialState: IState = {}
