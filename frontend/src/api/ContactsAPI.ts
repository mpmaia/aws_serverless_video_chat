import {AddContactRequest, Contact} from "../model/Contact";
import axios, {AxiosInstance} from "axios";
import {BASE_URL} from "../env";


const GET_CONTACTS_PATH = '/contacts';
const NEW_CONTACTS_PATH = '/contacts';
const DEL_CONTACTS_PATH = '/contacts';

class ContactsAPI {

    axiosInstance: AxiosInstance;

    constructor(jwtToken: string) {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL
        });
        this.axiosInstance.interceptors.request.use(config => {
            config.headers.Authorization = 'Bearer ' + jwtToken ;
            return config;
        });
    }

    async getContacts(): Promise<Contact[]> {
        return await this.axiosInstance.get(GET_CONTACTS_PATH).then(resp => resp.data.items);
    }

    async addContact(contact: AddContactRequest): Promise<Contact[]> {
        return await this.axiosInstance.post(NEW_CONTACTS_PATH, contact).then(resp => resp.data.items);
    }

    async removeContact(contact: Contact): Promise<Contact[]> {
        return await this.axiosInstance.delete(DEL_CONTACTS_PATH + '/' + contact.contactUserId).then(resp => resp.data.items);
    }
}

export default ContactsAPI;
