import userReducerAction from './userReducerAction';
import { User, FriendShip, FriendRequestResponse } from '../../../type';

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

export const updateUserInfoSuccess = (payload: User) => {
    return {
        type: userReducerAction.UPDATE_USER_SUCCESS,
        payload: payload,
    };
};

export const updateUserInfoFail = () => {
    return {
        type: userReducerAction.UPDATE_USER_FAIL,
    };
};

export const uploadAvatarSuccess = (payload: string) => {
    return {
        type: userReducerAction.UPLOAD_AVATAR_SUCCESS,
        payload: payload,
    };
};

export const uploadAvatarFail = () => {
    return {
        type: userReducerAction.UPLOAD_AVATAR_SUCCESS,
    };
};

export const getListFriendSuccess = (payload: FriendShip[]) => {
    return {
        type: userReducerAction.GET_LIST_FRIEND_SUCCESS,
        payload: payload,
    };
};

export const getListFriendFail = () => {
    return {
        type: userReducerAction.GET_LIST_FRIEND_FAIL,
    };
};

export const getListFriendRequestSuccess = (payload: FriendRequestResponse[]) => {
    return {
        type: userReducerAction.GET_LIST_FRIEND_REQUEST_SUCCESS,
        payload: payload,
    };
};

export const acceptFriendSuccess = (payload: string) => {
    return {
        type: userReducerAction.ACCEPT_FRIEND_SUCCESS,
        payload: payload,
    };
};

export const acceptFriendFail = () => {
    return {
        type: userReducerAction.ACCEPT_FRIEND_FAIL,
    };
};

export const removeFriendRequest = (payload: string) => {
    return {
        type: userReducerAction.REMOVE_FRIEND_REQUEST,
        payload: payload,
    };
};

export const getListFriendRequestFail = () => {
    return {
        type: userReducerAction.GET_LIST_FRIEND_REQUEST_FAIL,
    };
};

export const logout = () => {
    return {
        type: userReducerAction.LOGOUT,
    };
};
