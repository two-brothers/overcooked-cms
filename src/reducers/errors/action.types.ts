import { Action as BaseAction } from 'redux'

/**
 * Add a new error message to the state
 */
export type AddError = BaseAction<ActionNames.ADD_ERROR> & {
    error: string
}

export type Action = AddError

export enum ActionNames {
    ADD_ERROR = 'ADD_ERROR'
}