import axios from 'axios';
import { url } from 'inspector';

interface getType {
    path: string;
    options?: {};
}

const httpRequest = axios.create({
    baseURL: 'http://localhost:8080/api/',
});

export const get = async ({ path, options = {} }: getType) => {
    const respone = await httpRequest.get(path, options);
    return respone;
};

export const post = async ({ path, options = {} }: getType) => {
    const respone = await httpRequest.post(path, options);
    return respone;
};

export default httpRequest;
