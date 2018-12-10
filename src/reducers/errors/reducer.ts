import { Action, ActionNames } from './action.types';

export type IState = Error[];

export default function (state = initialState, action: Action) {
    switch (action.type) {
        case ActionNames.ADD_ERROR:
            return [
                ...state,
                action.error
            ];
        default:
            return state;
    }
};

const initialState: IState = [];