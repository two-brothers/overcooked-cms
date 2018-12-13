import axios from 'axios';
import { IFood, INewFood, INewRecipe, IPagedFood, IPagedRecipes, IRecipe } from './interfaces';

/**
 * A class to interact with the Overcooked backend server.
 * The server API and responses are documented at
 * https://overcooked.2brothers.tech/api/
 */
class Server {

    /**
     * Retrieves the food records at the specified page.
     * @param page the index of the page to retrieve
     */
    public static getFoodPage(page: number): Promise<IPagedFood> {
        return axios.get(`${Server.baseUrl}/food/at/${String(page)}`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage);
    }

    /**
     * Sends the specified food item to the server for creation
     * @param item the food item to be created
     */
    public static createFood(item: INewFood): Promise<IFood> {
        return axios.post(`${Server.baseUrl}/food`, item)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage);
    }

    /**
     * Requests that the specified food item be deleted from the server
     * @param id the id of the food item to delete
     */
    public static deleteFood(id: string): Promise<void> {
        return axios.delete(`${Server.baseUrl}/food/${id}`)
            .then(() => undefined)
            .catch(Server.useOriginalErrorMessage);
    }

    /**
     * Retrieves the recipe records at the specified page.
     * @param page the index of the page to retrieve
     */
    public static getRecipePage(page: number): Promise<IPagedRecipes> {
        return axios.get(`${Server.baseUrl}/recipes/at/${String(page)}`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage);
    }

    /**
     * Sends the specified recipe to the server for creation
     * @param item the recipe item to be created
     */
    public static createRecipe(item: INewRecipe): Promise<IRecipe> {
        return axios.post(`${Server.baseUrl}/recipes`, item)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage);
    }

    /**
     * Requests that the specified recipe be deleted from the server
     * @param id the id of the recipe to delete
     */
    public static deleteRecipe(id: string): Promise<void> {
        return axios.delete(`${Server.baseUrl}/recipes/${id}`)
            .then(() => undefined)
            .catch(Server.useOriginalErrorMessage);
    }

    private static baseUrl: string = process.env.NODE_ENV === 'production' ?
        'https://overcooked.2brothers.tech' :
        'http://localhost:4000';

    /**
     * The Overcooked-API server provides more useful error messages than the generic axios one.
     * Use that error message if it exists
     * @param err the original server error wrapped in the axios error.
     */
    private static useOriginalErrorMessage(err: IOvercookedError) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error);
        }
        throw err;
    };
}

interface IOvercookedError extends Error {
    response: {
        data: {
            error: string
        };
    }
}

export default Server;