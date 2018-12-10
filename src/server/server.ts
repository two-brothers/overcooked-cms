import axios from 'axios';
import { IPagedFood } from './interfaces';

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
        return axios(`${Server.baseUrl}/food/at/${String(page)}`)
            .then(res => res.data.data)
    }

    private static baseUrl: string = process.env.NODE_ENV === 'production' ?
        'https://overcooked.2brothers.tech' :
        'http://localhost:4000';
}

export default Server;