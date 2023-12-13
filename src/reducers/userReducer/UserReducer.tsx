import { Action, User, State, MessageChat } from '../../type';
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
          listRelationShip: [],
          listGifItem: [],
          notifications: { listFriendRequest: [], listNotification: [] },
          i18n: i18n,
      }
    : {
          isLoggedIn: false,
          user: null,
          listRelationShip: [],
          listGifItem: [],
          notifications: { listFriendRequest: [], listNotification: [] },
          i18n: i18n,
      };

const UserReducer = (state: State = initalState, action: Action) => {
    const { type, payload } = action;
    console.log('>>>>>>>[reducer][action]:' + type + ' [payload]:' + payload);
    switch (type) {
        //register
        case actionTypes.REGISTER_SUCCESS:
            return { ...state, isLoggedIn: true, user: payload };
        //login
        case actionTypes.LOGIN_SUCCESS:
            return { ...state, isLoggedIn: true, user: payload };

        //add relationShip
        case actionTypes.GET_LIST_FRIEND_SUCCESS:
            return { ...state, listRelationShip: [...state.listRelationShip, ...payload] };
        case actionTypes.UPDATE_FRIEND_SHIP:
            const UPDATE_FRIEND_SHIP = state.listRelationShip.map((relationShip) => {
                if (relationShip.id === payload.id) {
                    return payload;
                }
                return relationShip;
            });
            return { ...state, listRelationShip: UPDATE_FRIEND_SHIP };
        case actionTypes.NOTIFY_ONLINE:
            const relationShip = state.listRelationShip.find((r) => r.id === payload.to);
            if (relationShip) {
                relationShip.timeStamp = payload.timestamp;
            }
            const newListRelationShip_NOTIFY_ONLINE = [...state.listRelationShip];
            return { ...state, listRelationShip: newListRelationShip_NOTIFY_ONLINE };
        case actionTypes.UPDATE_LAST_MESSAGE:
            const newListRelationShip_UPDATE_LAST_MESSAGE = state.listRelationShip.map((relationShip) => {
                if (
                    relationShip.id === (payload as MessageChat).from ||
                    relationShip.id === (payload as MessageChat).to
                ) {
                    return { ...relationShip, message: payload };
                }
                return relationShip;
            });
            return { ...state, listRelationShip: newListRelationShip_UPDATE_LAST_MESSAGE };

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
                listRelationShip: [],
                listGifItem: [],
                notifications: { listFriendRequest: [], listNotification: [] },
                i18n: i18n,
            };
        default:
            return state;
    }
};

export default UserReducer;
