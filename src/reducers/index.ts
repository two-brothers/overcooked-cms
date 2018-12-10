import { combineReducers } from 'redux';
import unitsReducer, { IUnitsState } from './units/reducer';

export default combineReducers({
    units: unitsReducer
});

export interface IGlobalState {
    units: IUnitsState
}