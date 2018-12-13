import { Dispatch } from 'redux';

import { INewFood } from '../../server/interfaces';
import Server from '../../server/server';
import { AddError } from '../errors/action.types';
import { recordError } from '../errors/actions';
import { IGlobalState } from '../index';
import { ActionNames, AddItem, RemoveItem, UpdateItems } from './action.types';
import { IState } from './reducer';

/**
 * Retrieve all the food items, one page at a time, and dispatch UPDATE_ITEMS as each page is retrieved.
 * If any of the retrieved items are already in the database, dispatch an error (and do not update the affected items).
 * Dispatch an error for any unexpected server response.
 */
export const initFood = () => (dispatch: Dispatch<UpdateItems | AddError>, getState: () => IGlobalState) =>
    initFoodPage(0, dispatch, getState);

const initFoodPage = (page: number, dispatch: Dispatch<UpdateItems | AddError>, getState: () => IGlobalState): Promise<undefined> =>
    Server.getFoodPage(page)
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
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined);

/**
 * Send the item to the server for creation, and dispatch ADD_ITEM when the new record is returned.
 * Dispatch an error for any unexpected server response.
 * @param item the new food item. This function does not validate the structure of the item
 */
export const createFood = (item: INewFood) => (dispatch: Dispatch<AddItem | AddError>) =>
    Server.createFood(item)
        .then(res => dispatch({
            item: res,
            type: ActionNames.ADD_ITEM
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined);

/**
 * Request that the specified food item be deleted from the server, and dispatch REMOVE_ITEM if successful.
 * Dispatch an error for any unexpected server response
 * @param id the id of the food item to be deleted
 */
export const deleteFood = (id: string) => (dispatch: Dispatch<RemoveItem | AddError>) =>
    Server.deleteFood(id)
        .then(() => dispatch({
            id,
            type: ActionNames.REMOVE_ITEM
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined);