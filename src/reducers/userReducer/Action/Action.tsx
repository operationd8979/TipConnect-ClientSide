import userReducerAction from './userReducerAction';
import { User } from '../../../type';

export const loginSuccess = (payload: User) => {
    return {
        type: userReducerAction.LOGIN_SUCCESS,
        payload: payload,
    };
};

export const loginFail = () => {
    return {
        type: userReducerAction.LOGIN_FAIL,
    };
};

export const registerSuccess = (payload: User) => {
    return {
        type: userReducerAction.REGISTER_SUCCESS,
        payload: payload,
    };
};

export const registerFail = () => {
    return {
        type: userReducerAction.REGISTER_FAIL,
    };
};

export const logout = () => {
    return {
        type: userReducerAction.LOGOUT,
    };
};
