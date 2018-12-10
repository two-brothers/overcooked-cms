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
        return fetch(`${Server.baseUrl}/at/${String(page)}`)
            .then(res => res.json());
    }

    private static baseUrl: string = 'https://overcooked.2brothers.tech'
}

export default Server;