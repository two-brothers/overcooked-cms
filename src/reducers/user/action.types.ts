import { Action as BaseAction } from 'redux';

/**
 * Set the user profile
 */
export type SetUser = BaseAction<ActionNames.SET_USER> & {
    profile: string;
};

/**
 * Clear the user profile
 */
export type ClearUser = BaseAction<ActionNames.CLEAR_USER>;

export type Action = SetUser | ClearUser;

export enum ActionNames {
    SET_USER = 'SET_USER',
    CLEAR_USER = 'CLEAR_USER'
}