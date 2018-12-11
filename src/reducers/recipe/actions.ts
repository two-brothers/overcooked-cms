import { Dispatch } from 'redux';
import { INewRecipe } from '../../server/interfaces';
import Server from '../../server/server';
import { AddError } from '../errors/action.types';
import { recordError } from '../errors/actions';
import { ActionNames, AddItem } from './action.types';

/**
 * Send the item to the server for creation, and dispatch ADD_ITEM when the new record is returned
 * Dispatch an error for any unexpected server response.
 * @param item the new recipe item. This function does not validate the structure of the recipe
 */
export const createRecipe = (item: INewRecipe) => (dispatch: Dispatch<AddItem | AddError>) =>
    Server.createRecipe(item)
        .then(res => dispatch({
            item: res,
            type: ActionNames.ADD_ITEM
        }))
        .catch(err => recordError(err)(dispatch))
        .then(() => undefined);