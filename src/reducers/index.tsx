import {
    loginSuccess,
    loginFail,
    registerSuccess,
    registerFail,
    getListFriendSuccess,
    getListFriendFail,
    updateUserInfoSuccess,
    updateUserInfoFail,
    uploadAvatarSuccess,
    uploadAvatarFail,
    logout,
} from './userReducer/Action';
import { connectSuccess, connectFail, disconnect } from './stompReducer/Action';

export {
    loginSuccess,
    loginFail,
    registerSuccess,
    registerFail,
    getListFriendSuccess,
    getListFriendFail,
    updateUserInfoSuccess,
    updateUserInfoFail,
    uploadAvatarSuccess,
    uploadAvatarFail,
    logout,
    connectSuccess,
    connectFail,
    disconnect,
};

export { default } from './Reducers';
