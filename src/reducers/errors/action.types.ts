import { Action as BaseAction } from 'redux';

export type AddError = BaseAction<ActionNames.ADD_ERROR> & {
    error: Error;
};

export type Action = AddError;

export enum ActionNames {ADD_ERROR}