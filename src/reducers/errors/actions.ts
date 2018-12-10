import { Dispatch } from 'redux';
import { ActionNames, AddError } from './action.types';

export const recordError = (err: Error) => (dispatch: Dispatch<AddError>) =>
    dispatch({
        error: err,
        type: ActionNames.ADD_ERROR
    });

