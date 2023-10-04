import axios from 'axios';
import { url } from 'inspector';

interface requestType {
    path: string;
    options?: {};
}

const httpRequest = axios.create({
    baseURL: 'http://localhost:8080/api/',
    withCredentials: true,
});

export const get = async ({ path, options = {} }: requestType) => {
    const respone = await httpRequest.get(path, options);
    return respone;
};

export const post = async ({ path, options = {} }: requestType) => {
    const respone = await httpRequest.post(path, options);
    return respone;
};

export default httpRequest;
