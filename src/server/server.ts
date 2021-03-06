import axios from 'axios'
import { IAugmentedRecipe, IFood, INewFood, INewRecipe, IPagedFood, IPagedRecipes, IRecipe } from './interfaces'

/**
 * A class to interact with the Overcooked backend server.
 * The server API and responses are documented at
 * https://overcooked.2brothers.tech/v1/api/
 */
class Server {
    /**
     * Retrieves and returns the current active user profile
     * (or null if there is no active user)
     */
    public static getActiveUser(): Promise<string | null> {
        return axios.get(`${ Server.version }/auth/whoami`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Logs the user out of the session
     */
    public static logOut(): Promise<void> {
        return axios.get(`${ Server.version }/auth/logout`)
            .then(() => undefined)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Retrieve the food record with the specified id
     * @param id the id of the food item
     */
    public static getFood(id: string): Promise<IFood> {
        return axios.get(`${ Server.version }/food/${ id }`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Retrieves the food records at the specified page.
     * @param page the index of the page to retrieve
     */
    public static getFoodPage(page: number): Promise<IPagedFood> {
        return axios.get(`${ Server.version }/food/at/${ String(page) }`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Sends the specified food item to the server for creation
     * @param item the food item to be created
     */
    public static createFood(item: INewFood): Promise<IFood> {
        return axios.post(`${ Server.version }/food`, item)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Sends the partial food item to the server to update the specified item
     * @param id the id of the food item to update
     * @param update the partial food item with the updated values
     */
    public static updateFood(id: string, update: Partial<INewFood>): Promise<IFood> {
        return axios.put(`${ Server.version }/food/${ id }`, update)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Requests that the specified food item be deleted from the server
     * @param id the id of the food item to delete
     */
    public static deleteFood(id: string): Promise<void> {
        return axios.delete(`${ Server.version }/food/${ id }`)
            .then(() => undefined)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Retrieve the recipe record with the specified id
     * @param id the id of the recipe item
     */
    public static getRecipe(id: string): Promise<IAugmentedRecipe> {
        return axios.get(`${ Server.version }/recipes/${ id }`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Retrieves the recipe records at the specified page.
     * @param page the index of the page to retrieve
     */
    public static getRecipePage(page: number): Promise<IPagedRecipes> {
        return axios.get(`${ Server.version }/recipes/at/${ String(page) }`)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Sends the specified recipe to the server for creation
     * @param item the recipe item to be created
     */
    public static createRecipe(item: INewRecipe): Promise<IRecipe> {
        return axios.post(`${ Server.version }/recipes`, item)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Sends the partial recipe to the server to update the specified recipe
     * @param id the id of the recipe to update
     * @param update the partial recipe with the updated values
     */
    public static updateRecipe(id: string, update: Partial<INewRecipe>): Promise<IRecipe> {
        return axios.put(`${ Server.version }/recipes/${ id }`, update)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Requests that the specified recipe be deleted from the server
     * @param id the id of the recipe to delete
     */
    public static deleteRecipe(id: string): Promise<void> {
        return axios.delete(`${ Server.version }/recipes/${ id }`)
            .then(() => undefined)
            .catch(Server.useOriginalErrorMessage)
    }

    /**
     * Upload the specified file to the server. Return the relative download url
     * @param file the file to upload
     */
    public static upload(file: Blob): Promise<string> {
        const formData = new FormData()
        formData.append('file', file)
        return axios.post(`${ Server.version }/upload`, formData)
            .then(res => res.data.data)
            .catch(Server.useOriginalErrorMessage)
    }

    private static version = '/v1'

    /**
     * The Overcooked-API server provides more useful error messages than the generic axios one.
     * Use that error message if it exists
     * @param err the original server error wrapped in the axios error.
     */
    private static useOriginalErrorMessage(err: IOvercookedError) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error)
        }
        throw err
    }
}

interface IOvercookedError extends Error {
    response: {
        data: {
            error: string
        }
    }
}

export default Server
