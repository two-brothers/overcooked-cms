import { Dispatch } from 'redux'

import Server from '../../server/server'
import { AddError } from '../errors/action.types'
import { recordError } from '../errors/actions'
import { ActionNames, ClearUser, SetUser } from './action.types'

/**
 * Retrieve the active user from the server and dispatch SET_USER with the user profile
 * or CLEAR_USER if there is no active user
 * Dispatch an error for any unexpected server response
 */
export const retrieveUser = () => (dispatch: Dispatch<SetUser | ClearUser | AddError>) =>
    Server.getActiveUser()
        .then(profile => profile ?
            dispatch({
                profile,
                type: ActionNames.SET_USER
            }) :
            dispatch({ type: ActionNames.CLEAR_USER })
        )
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)

/**
 * Log the user out of the session and then dispatch CLEAR_USER
 */
export const logOut = () => (dispatch: Dispatch<ClearUser | AddError>) =>
    Server.logOut()
        .then(() => dispatch({ type: ActionNames.CLEAR_USER }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)