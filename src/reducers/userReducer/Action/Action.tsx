import userReducerAction from './userReducerAction';
import { User, FriendShip, FriendRequestResponse, MessageChat, Gif, OnlineNotification } from '../../../type';
import { I18n } from 'i18n-js';

export const loginSuccess = (payload: User) => {
    return {
        type: userReducerAction.LOGIN_SUCCESS,
        payload,
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
        payload,
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
        payload,
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
        payload,
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
        payload,
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
        payload,
    };
};

export const acceptFriendSuccess = (payload: string) => {
    return {
        type: userReducerAction.ACCEPT_FRIEND_SUCCESS,
        payload,
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
        payload,
    };
};

export const getListFriendRequestFail = () => {
    return {
        type: userReducerAction.GET_LIST_FRIEND_REQUEST_FAIL,
    };
};

export const updateLastMessage = (payload: MessageChat) => {
    return {
        type: userReducerAction.UPDATE_LAST_MESSAGE,
        payload,
    };
};

export const getGifItems = (payload: Gif[]) => {
    return {
        type: userReducerAction.GET_GIF_ITEMS,
        payload,
    };
};

export const updateFriendShip = (payload: FriendShip) => {
    return {
        type: userReducerAction.UPDATE_FRIEND_SHIP,
        payload,
    };
};

export const changeLanguage = (payload: I18n) => {
    return {
        type: userReducerAction.CHANGE_LANGUAGE,
        payload,
    };
};

export const changeOnline = (payload: OnlineNotification) => {
    return {
        type: userReducerAction.NOTIFY_ONLINE,
        payload,
    };
};

export const logout = () => {
    return {
        type: userReducerAction.LOGOUT,
    };
};
