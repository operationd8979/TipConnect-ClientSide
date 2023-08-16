import {REGISTER_USER,LOGIN_USER,LOGOUT_USER} from './constants'


const registerUser = (payload: string) => ({
    type: REGISTER_USER,
    payload,
});

const loginUser = (payload: string) => ({
    type: LOGIN_USER,
    payload,
});

const logoutUser = (payload: number) => ({
    type: LOGOUT_USER,
    payload,
});