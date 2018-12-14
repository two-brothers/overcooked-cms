import { Dispatch } from 'redux';
import { INewRecipe } from '../../server/interfaces';
import Server from '../../server/server';
import { AddError } from '../errors/action.types';
import { recordError } from '../errors/actions';
import { ActionNames, AddItems, RemoveItem } from './action.types';

/**
 * Retrieve all the recipe items, one page at a time, and dispatch ADD_ITEMS as each page is retrieved.
 * Dispatch an error for any unexpected server response.
 */
export const initRecipes = () => (dispatch: Dispatch<AddItems | AddError>) =>
    initRecipePage(0, dispatch);

const initRecipePage = (page: number, dispatch: Dispatch<AddItems | AddError>): Promise<undefined> =>
    Server.getRecipePage(page)
        .then(res => {
            dispatch({
                items: res.recipes,
                type: ActionNames.ADD_ITEMS
            });

            return res.last_page ?
                Promise.resolve(undefined) :
                initRecipePage(page + 1, dispatch);
        })
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined);

/**
 * Send the item to the server for creation, and dispatch ADD_ITEM when the new record is returned
 * Dispatch an error for any unexpected server response.
 * @param item the new recipe item. This function does not validate the structure of the recipe
 */
export const createRecipe = (item: INewRecipe) => (dispatch: Dispatch<AddItems | AddError>) =>
    Server.createRecipe(item)
        .then(res => dispatch({
            items: [res],
            type: ActionNames.ADD_ITEMS
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined);

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
        .then(() => undefined);