import axios from 'axios';

interface requestType {
    path: string;
    options?: {};
}

const httpRequest = axios.create({
    baseURL: 'http://localhost:8080/api/',
    withCredentials: true,
});
// const httpRequest = axios.create({
//     baseURL: 'http://25.14.203.251/api/',
//     withCredentials: true,
// });

export const get = async ({ path, options = {} }: requestType) => {
    console.log('>>>>>>>API call: [medthod]:get  [path]:' + path + '  [option]:' + options);
    const response = await httpRequest.get(path, options);
    return response;
};

export const post = async ({ path, options = {} }: requestType) => {
    console.log('>>>>>>>API call: [medthod]:post  [path]:' + path + '  [option]:' + options);
    const response = await httpRequest.post(path, options);
    return response;
};

export const postMultipart = async ({ path, options = {} }: requestType) => {
    console.log('>>>>>>>API call: [medthod]:post  [path]:' + path + '  [option]:' + options);
    const response = await httpRequest.post(path, options, {
        headers: {
            'Content-Type': `multipart/form-data`,
        },
    });
    return response;
};

export const getStream = async ({ path, options = {} }: requestType) => {
    console.log('>>>>>>>API call: [medthod]:getStream  [path]:' + path + '  [option]:' + options);
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
