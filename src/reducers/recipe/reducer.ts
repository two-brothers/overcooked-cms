import { IRecipe } from '../../server/interfaces';
import { Action, ActionNames } from './action.types';

export type IState = IRecipe[];

/**
 * Handle the recipe actions as follows
 *  - ADD_ITEM: append a single new recipe item to the state
 * @param state the list of recipes before the action is applied
 * @param action the action to apply
 * @returns the list of recipes after the action has been applied
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.ADD_ITEM:
            return [
                ...state,
                action.item
            ];
        default:
            return state;
    }
};

const initialState: IState = [];