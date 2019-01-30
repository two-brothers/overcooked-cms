import { Dispatch } from 'redux'

import { INewFood } from '../../server/interfaces'
import Server from '../../server/server'
import { AddError } from '../errors/action.types'
import { recordError } from '../errors/actions'
import { IGlobalState } from '../index'
import { ActionNames, RemoveItem, ReplaceItems, UpdateItem } from './action.types'

/**
 * Retrieve all the food items, one page at a time, and dispatch UPDATE_ITEMS as each page is retrieved.
 * Dispatch an error for any unexpected server response.
 */
export const initFood = () => (dispatch: Dispatch<ReplaceItems | AddError>) =>
    initFoodPage(0, dispatch)

const initFoodPage = (page: number, dispatch: Dispatch<ReplaceItems | AddError>): Promise<undefined> =>
    Server.getFoodPage(page)
        .then(res => {
            dispatch({
                items: res.food,
                type: ActionNames.REPLACE_ITEMS
            })

            return res.last_page ? Promise.resolve(undefined) : initFoodPage(page + 1, dispatch)
        })
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)

/**
 * Retrieve the specified food item and dispatch UPDATE_ITEMS when the record is returned.
 * Dispatch an error for any unexpected server response.
 * @param id the id of the food item
 */
export const getFood = (id: string) => (dispatch: Dispatch<ReplaceItems | AddError>, getState: () => IGlobalState) =>
    getState().food[id] ?
        Promise.resolve(undefined) : // if the item already exists in the store, don't fetch it
        Server.getFood(id)
            .then(res => dispatch({
                items: [res],
                type: ActionNames.REPLACE_ITEMS
            }))
            .catch(err => recordError(err)(dispatch))
            .then(() => undefined)

/**
 * Send the item to the server for creation, and dispatch UPDATE_ITEMS when the new record is returned.
 * Dispatch an error for any unexpected server response.
 * @param item the new food item. This function does not validate the structure of the item
 */
export const createFood = (item: INewFood) => (dispatch: Dispatch<ReplaceItems | AddError>) =>
    Server.createFood(item)
        .then(res => dispatch({
            items: [res],
            type: ActionNames.REPLACE_ITEMS
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)

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
        .then(() => undefined)

/**
 * Request that the specified food item be updated with the specified value, and dispatch UPDATE_ITEM if successful.
 * Dispatch an error for any unexpected server response
 * @param id the id of the food item to be updated
 * @param update the new properties to apply to the food item
 */
export const updateFood = (id: string, update: Partial<INewFood>) => (dispatch: Dispatch<UpdateItem | AddError>) =>
    Server.updateFood(id, update)
        .then(() => dispatch({
            id,
            type: ActionNames.UPDATE_ITEM,
            update
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)
