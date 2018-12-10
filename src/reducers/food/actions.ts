import { Dispatch } from 'redux';

import Server from '../../server/server';
import { AddError } from '../errors/action.types';
import { recordError } from '../errors/actions';
import { IGlobalState } from '../index';
import { ActionNames, UpdateItems } from './action.types';
import { IState } from './reducer';

/**
 * Retrieve all the food items, one page at a time, and dispatch UPDATE_ITEMS as each page is retrieved.
 * If any of the retrieved items are already in the database, dispatch an error (and do not update the affected items).
 */
export const initFood = () => (dispatch: Dispatch<UpdateItems | AddError>, getState: () => IGlobalState) =>
    initFoodPage(0, dispatch, getState);

function initFoodPage(page = 0, dispatch: Dispatch<UpdateItems | AddError>, getState: () => IGlobalState): Promise<undefined> {
    return Server.getFoodPage(page)
        .then(res => {
            const state: IState = getState().food;
            const newFoods = res.food.filter(f => state[f.id] === undefined);
            const existingFoods = res.food.filter(f => state[f.id] !== undefined);

            dispatch({
                items: newFoods,
                type: ActionNames.UPDATE_ITEMS
            });

            return Promise.all([
                ...existingFoods.map(duplicate =>
                    recordError(new Error(`Cannot add food item ${duplicate.id}. It already exists`))(dispatch)
                ),
                res.last_page ? Promise.resolve(undefined) : initFoodPage(page + 1, dispatch, getState)
            ]);
        })
        .then(() => undefined);
}