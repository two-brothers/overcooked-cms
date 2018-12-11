import { IFood } from '../../server/interfaces';
import { Action, ActionNames } from './action.types';

export interface IState {
    [id: string]: IFood;
}

/**
 * Handle the food actions as follows
 *  - UPDATE_ITEMS:  add new food items to the state,  overwriting existing ones with the same IDs
 *  - ADD_ITEM: add a single new food item to the state, overwriting any existing one with the same ID
 *  - REMOVE_ITEM: remove the food item from the state, if it exists
 * @param state the state before the action is applied
 * @param action the action to apply
 * @returns the new state after the action has been applied
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.UPDATE_ITEMS:
            const updates = {};
            action.items.map(item => {
                updates[item.id] = item;
            });
            return Object.assign({}, state, updates);
        case ActionNames.ADD_ITEM:
            const update = {[action.item.id]: action.item};
            return Object.assign({}, state, update);
        case ActionNames.REMOVE_ITEM:
            const updated = Object.assign({}, state);
            delete updated[action.id];
            return updated;
        default:
            return state;
    }
};

const initialState: IState = {};