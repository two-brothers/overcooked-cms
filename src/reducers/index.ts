import { combineReducers } from 'redux';
import errorsReducer, { IState as IErrorsState } from './errors/reducer';
import unitsReducer, { IState as IUnitsState } from './units/reducer';

export default combineReducers({
    errors: errorsReducer,
    units: unitsReducer
});

export interface IGlobalState {
    errors: IErrorsState
    units: IUnitsState
}