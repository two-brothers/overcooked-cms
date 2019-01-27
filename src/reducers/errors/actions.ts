import { Dispatch } from 'redux';
import { ActionNames, AddError } from './action.types';

/**
 * Dispatch the AddError action to add the specified error to the state,
 * and throw the error again so consumers still know about it
 * @param err the error to record
 */
export const recordError = (err: Error) => (dispatch: Dispatch<AddError>) =>
    Promise.resolve({
        error: err.message,
        type: ActionNames.ADD_ERROR
    })
        .then(action => dispatch(action))
        .then(() => {
            throw err;
        });



