import axios from 'axios';
import { IFood, INewFood, IPagedFood } from './interfaces';

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
            .then(res => res.data.data);
    }

    /**
     * Sends the specified food item to the server for creation
     * @param item the food item to be created
     */
    public static createFood(item: INewFood): Promise<IFood> {
        return axios.post(`${Server.baseUrl}/food`, item)
            .then(res => res.data.data);
    }

    /**
     * Requests that the specified food item be deleted from the server
     * @param id the id of the food item to delete
     */
    public static deleteFood(id: string): Promise<undefined> {
        return axios.delete(`${Server.baseUrl}/food/${id}`)
            .then(() => undefined);
    }

    private static baseUrl: string = process.env.NODE_ENV === 'production' ?
        'https://overcooked.2brothers.tech' :
        'http://localhost:4000';
}

export default Server;