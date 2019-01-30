import { Action, ActionNames } from './action.types'

export type IState = Error[]

/**
 * Handle the ADD_ERROR action (by adding the error to the state)
 * @param state the state before the new error is added
 * @param action the action to apply
 * @returns the new state after the action has been applied
 */
export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.ADD_ERROR:
            return [
                ...state,
                action.error
            ]
        default:
            return state
    }
}

const initialState: IState = []