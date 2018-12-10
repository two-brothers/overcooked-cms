import { combineReducers } from 'redux';

import errorsReducer, { IState as IErrorsState } from './errors/reducer';
import foodReducer, { IState as IFoodState } from './food/reducer';
import unitsReducer, { IState as IUnitsState } from './units/reducer';

export default combineReducers({
    errors: errorsReducer,
    food: foodReducer,
    units: unitsReducer
});

export interface IGlobalState {
    errors: IErrorsState;
    food: IFoodState;
    units: IUnitsState;
}