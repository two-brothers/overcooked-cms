import { Action, ActionNames } from './action.types'

export interface IState {
    profile: string | null
}

/**
 * Handle the authentication actions as follows:
 *  - SET_USER: set the user profile
 *  - CLEAR_USER: set the user profile to null
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.SET_USER:
            return { profile: action.profile }
        case ActionNames.CLEAR_USER:
            return { profile: null }
        default:
            return state
    }
}

const initialState: IState = {
    profile: null
}
