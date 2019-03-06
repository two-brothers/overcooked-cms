import { Dispatch } from 'redux'
import { INewRecipe } from '../../server/interfaces'
import Server from '../../server/server'
import { AddError } from '../errors/action.types'
import { recordError } from '../errors/actions'
import { ActionNames as FoodActionNames, ReplaceItems as ReplaceFoodItems } from '../food/action.types'
import { IGlobalState } from '../index'
import { ActionNames, RemoveItem, ReplaceItems, UpdateItem } from './action.types'

/**
 * Retrieve all the recipe items, one page at a time, and dispatch REPLACE_ITEMS (on the food and recipes)
 * as each page is retrieved.
 * Dispatch an error for any unexpected server response.
 */
export const initRecipes = () => (dispatch: Dispatch<ReplaceItems | ReplaceFoodItems | AddError>) =>
    initRecipePage(0, dispatch)

const initRecipePage = (page: number, dispatch: Dispatch<ReplaceItems | ReplaceFoodItems | AddError>): Promise<undefined> =>
    Server.getRecipePage(page)
        .then(res => {
            dispatch({
                items: res.food,
                type: FoodActionNames.REPLACE_ITEMS
            })

            dispatch({
                items: res.recipes,
                type: ActionNames.REPLACE_ITEMS
            })

            return res.lastPage ?
                Promise.resolve(undefined) :
                initRecipePage(page + 1, dispatch)
        })
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)

/**
 * Retrieve the specified recipe and dispatch UPDATE_ITEMS when the record is returned.
 * Dispatch an error for any unexpected server response.
 * @param id the id of the food item
 */
export const getRecipe = (id: string) => (dispatch: Dispatch<ReplaceItems | ReplaceFoodItems | AddError>, getState: () => IGlobalState) =>
    getState().recipes[id] ?
        Promise.resolve(undefined) : // if the recipe already exists in the store, don't fetch it
        Server.getRecipe(id)
            .then(res => {
                dispatch({
                    items: res.food,
                    type: FoodActionNames.REPLACE_ITEMS
                })

                dispatch({
                    items: [res.recipe],
                    type: ActionNames.REPLACE_ITEMS
                })
            })
            .catch(err => recordError(err)(dispatch))
            .then(() => undefined)

/**
 * Send the item to the server for creation, and dispatch REPLACE_ITEMS when the new record is returned
 * Dispatch an error for any unexpected server response.
 * Return the new recipe id
 * @param item the new recipe item. This function does not validate the structure of the recipe
 */
export const createRecipe = (item: INewRecipe) => (dispatch: Dispatch<ReplaceItems | AddError>) =>
    Server.createRecipe(item)
        .then(res => {
            dispatch({
                items: [res],
                type: ActionNames.REPLACE_ITEMS
            })
            return res.id
        })
        .catch(err => recordError(err)(dispatch))

/**
 * Request that the specified recipe be deleted from the server, and dispatch REMOVE_ITEM if successful.
 * Dispatch an error for any unexpected server response
 * @param id the id of the recipe to be deleted
 */
export const deleteRecipe = (id: string) => (dispatch: Dispatch<RemoveItem | AddError>) =>
    Server.deleteRecipe(id)
        .then(() => dispatch({
            id,
            type: ActionNames.REMOVE_ITEM
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)

/**
 * Request that the specified recipe be updated with the specified values, and dispatch UPDATE_ITEM if successful.
 * Dispatch an error for any unexpected server response
 * @param id the id of the recipe to be updated
 * @param update the new properties to apply to the recipe
 */
export const updateRecipe = (id: string, update: Partial<INewRecipe>) => (dispatch: Dispatch<UpdateItem | AddError>) =>
    Server.updateRecipe(id, update)
        .then(() => dispatch({
            id,
            type: ActionNames.UPDATE_ITEM,
            update
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined)
