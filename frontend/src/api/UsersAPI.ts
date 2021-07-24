import axios, {AxiosInstance} from "axios";
import {BASE_URL} from "../env";
import {User} from "../model/User";


const GET_USERS_PATH = '/user';

class UsersAPI {

    axiosInstance: AxiosInstance;

    constructor(jwtToken: string) {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL
        });
        this.axiosInstance.interceptors.request.use(config => {
            config.headers.Authorization = 'Bearer ' + jwtToken;
            return config;
        });
    }

    async getUser(): Promise<User> {
        return await this.axiosInstance.get(GET_USERS_PATH).then(resp => resp.data.item);
    }
}

export default UsersAPI;
