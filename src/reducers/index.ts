import { combineReducers } from 'redux';

import errorsReducer, { IState as IErrorsState } from './errors/reducer';
import foodReducer, { IState as IFoodState } from './food/reducer';
import recipeReducer, { IState as IRecipeState } from './recipe/reducer';
import unitsReducer, { IState as IUnitsState } from './units/reducer';

export default combineReducers({
    errors: errorsReducer,
    food: foodReducer,
    recipes: recipeReducer,
    units: unitsReducer
});

export interface IGlobalState {
    errors: IErrorsState;
    food: IFoodState;
    recipes: IRecipeState;
    units: IUnitsState;
}