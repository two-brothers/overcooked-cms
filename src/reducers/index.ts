import { combineReducers } from 'redux'

import errorsReducer, { IState as IErrorsState } from './errors/reducer'
import foodReducer, { IState as IFoodState } from './food/reducer'
import recipeReducer, { IState as IRecipeState } from './recipe/reducer'
import unitsReducer, { IState as IUnitsState } from './units/reducer'
import userReducer, { IState as IUserState } from './user/reducer'

export default combineReducers({
    errors: errorsReducer,
    food: foodReducer,
    recipes: recipeReducer,
    units: unitsReducer,
    user: userReducer
})

export interface IGlobalState {
    errors: IErrorsState
    food: IFoodState
    recipes: IRecipeState
    units: IUnitsState
    user: IUserState
}