import { IRecipe } from '../../server/interfaces';
import { Action, ActionNames } from './action.types';

export type IState = IRecipe[];

/**
 * Handle the recipe actions as follows
 *  - ADD_ITEMS: append all new recipes to the state
 *  - REMOVE_ITEM: remove the specified recipe from the state, if it exists
 *  - UPDATE_ITEM: update any recipes matching the specified id with the specified properties
 * @param state the list of recipes before the action is applied
 * @param action the action to apply
 * @returns the list of recipes after the action has been applied
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.ADD_ITEMS:
            return [
                ...state,
                ...action.items
            ];
        case ActionNames.REMOVE_ITEM:
            return state.filter(recipe => recipe.id !== action.id);
        case ActionNames.UPDATE_ITEM:
            return state.map(recipe => recipe.id === action.id ?
                Object.assign({}, recipe, action.update) :
                recipe
            );
        default:
            return state;
    }
};

const initialState: IState = [];