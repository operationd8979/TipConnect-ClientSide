import axios from 'axios';

interface requestType {
    path: string;
    options?: {};
}

const httpRequest = axios.create({
    baseURL: 'http://localhost:8080/api/',
    withCredentials: true,
});

export const get = async ({ path, options = {} }: requestType) => {
    const response = await httpRequest.get(path, options);
    return response;
};

export const post = async ({ path, options = {} }: requestType) => {
    const response = await httpRequest.post(path, options);
    return response;
};

export const getStream = async ({ path, options = {} }: requestType) => {
    const response = await fetch(`http://localhost:8080/api/${path}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return response;
};

export default httpRequest;
