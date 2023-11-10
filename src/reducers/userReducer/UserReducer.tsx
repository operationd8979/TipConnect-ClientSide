import { Action, User, State, FriendShip } from '../../type';
import actionTypes from './Action';

const currentUser = localStorage.getItem('currentUser');
let user;
if (currentUser) {
    user = JSON.parse(currentUser) as User;
}

const initalState: State = user
    ? { isLoggedIn: true, user, listFriend: null }
    : { isLoggedIn: false, user: null, listFriend: null };

const UserReducer = (state: State = initalState, action: Action) => {
    const { type, payload } = action;
    switch (type) {
        case actionTypes.REGISTER_SUCCESS:
            return { ...state, isLoggedIn: true, user: payload };
        case actionTypes.REGISTER_FAIL:
            return { ...state, isLoggedIn: false };
        case actionTypes.LOGIN_SUCCESS:
            return { ...state, isLoggedIn: true, user: payload };
        case actionTypes.REGISTER_FAIL:
            return { ...state, isLoggedIn: false };
        case actionTypes.UPDATE_USER_INFO:
            return { ...state, user: payload };
        case actionTypes.GET_LIST_FRIEND_SUCCESS:
            return { ...state, listFriend: payload };
        case actionTypes.GET_LIST_FRIEND_FAIL:
            return state;
        case actionTypes.LOGOUT:
            return { ...state, isLoggedIn: false, user: null };
        default:
            return state;
    }
};

export default UserReducer;
