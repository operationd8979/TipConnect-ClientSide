import { Action, User, State, FriendShip, FriendRequestResponse, MessageChat } from '../../type';
import actionTypes from './Action';
import i18n from '../../i18n/i18n';

const currentUser = localStorage.getItem('currentUser');
let user;
if (currentUser) {
    user = JSON.parse(currentUser) as User;
}

const initalState: State = user
    ? {
          isLoggedIn: true,
          user,
          listFriend: [],
          listGifItem: [],
          notifications: { listFriendRequest: [], listNotification: [] },
          i18n: i18n,
      }
    : {
          isLoggedIn: false,
          user: null,
          listFriend: [],
          listGifItem: [],
          notifications: { listFriendRequest: [], listNotification: [] },
          i18n: i18n,
      };

const UserReducer = (state: State = initalState, action: Action) => {
    const { type, payload } = action;
    switch (type) {
        case actionTypes.REGISTER_SUCCESS:
            return { ...state, isLoggedIn: true, user: payload };
        case actionTypes.LOGIN_SUCCESS:
            return { ...state, isLoggedIn: true, user: payload };

        case actionTypes.GET_LIST_FRIEND_SUCCESS:
            return { ...state, listFriend: [...state.listFriend, ...payload] };
        case actionTypes.UPDATE_FRIEND_SHIP:
            const UPDATE_FRIEND_SHIP = state.listFriend.map((friendShip) => {
                if (friendShip.friend.userID === payload.friend.userID) {
                    return payload;
                }
                return friendShip;
            });
            return { ...state, listFriend: UPDATE_FRIEND_SHIP };
        case actionTypes.NOTIFY_ONLINE:
            const friendShip = state.listFriend.find((f) => f.friend.userID === payload.from);
            if (friendShip) {
                friendShip.timeStamp = payload.timestamp;
            }
            const newListFriendOnline = [...state.listFriend];
            return { ...state, listFriend: newListFriendOnline };
        case actionTypes.UPDATE_LAST_MESSAGE:
            const newListFriend = state.listFriend.map((friendShip) => {
                if (
                    friendShip.friend.userID === (payload as MessageChat).from ||
                    friendShip.friend.userID === (payload as MessageChat).to
                ) {
                    return { ...friendShip, message: payload };
                }
                return friendShip;
            });
            return { ...state, listFriend: newListFriend };

        case actionTypes.UPDATE_USER_SUCCESS:
            return { ...state, user: payload };
        case actionTypes.UPLOAD_AVATAR_SUCCESS:
            return { ...state, user: { ...state.user, urlAvatar: payload } };

        case actionTypes.GET_LIST_FRIEND_REQUEST_SUCCESS:
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    listFriendRequest: [...state.notifications.listFriendRequest, ...payload],
                },
            };

        case actionTypes.REMOVE_FRIEND_REQUEST:
        case actionTypes.ACCEPT_FRIEND_SUCCESS:
            const newFriendRequests = state.notifications.listFriendRequest.filter(
                (friendRequest) => friendRequest.id !== payload,
            );
            return {
                ...state,
                notifications: {
                    ...state.notifications,
                    listFriendRequest: newFriendRequests,
                },
            };

        case actionTypes.GET_GIF_ITEMS:
            return {
                ...state,
                listGifItem: payload,
            };

        case actionTypes.REGISTER_FAIL:
        case actionTypes.LOGIN_FAIL:
            return { ...state, isLoggedIn: false };

        case actionTypes.CHANGE_LANGUAGE:
            localStorage.setItem('i18n', payload.locale);
            return { ...state, i18n: payload };

        case actionTypes.ACCEPT_FRIEND_FAIL:
        case actionTypes.GET_LIST_FRIEND_REQUEST_FAIL:
        case actionTypes.GET_LIST_FRIEND_FAIL:
        case actionTypes.UPDATE_USER_FAIL:
        case actionTypes.UPLOAD_AVATAR_FAIL:
        case actionTypes.LOGOUT:
            localStorage.removeItem('currentUser');
            return {
                isLoggedIn: false,
                user: null,
                listFriend: [],
                listGifItem: [],
                notifications: { listFriendRequest: [], listNotification: [] },
                i18n: i18n,
            };
        default:
            return state;
    }
};

export default UserReducer;
