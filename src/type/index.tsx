import { I18n } from 'i18n-js';
import { Client } from 'webstomp-client';

export interface User {
    userID: string;
    email?: string;
    fullName: string;
    role: string;
    urlAvatar: string;
    enable: boolean;
    firstName: string;
    lastName: string;
    state: string;
}

export interface UpdateInfoRequest {
    firstName: string;
    lastName: string;
    newPassword: string;
    password: string;
}

export interface UpdateAvatarRequest {
    urlAvatar: string;
}

export interface RelationShip {
    id: string;
    name: string;
    urlPic: string;
    friends: User[];
    type: string;
    message?: MessageChat;
    timeStamp?: string;
    isGroup: boolean;
}

export interface Action {
    type: string;
    payload: any;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface SearchQuery {
    query: string;
    offset: number;
    limit: number;
}

export interface AuthenticationReponse {
    code: number;
    user: User;
    message: string;
    error_message: string;
}

export interface SearchResponse {
    tinyUser: User | null;
    messages: MessageChat[];
}

export interface Response {
    code: number;
    message: string;
}

export interface FriendRequestResponse {
    id: string;
    sender: User;
    time_stamp: bigint;
}

export interface Notifications {
    listFriendRequest: FriendRequestResponse[];
    listNotification: string[];
}

export interface Gif {
    gifID: number;
    gifName: string;
    url: string;
}

export interface State {
    isLoggedIn: boolean;
    user: User | null;
    listRelationShip: RelationShip[];
    listGifItem: Gif[];
    notifications: Notifications;
    i18n: I18n;
}

export interface StateWS {
    socket: WebSocket;
    stompClient: Client;
    currentMessage: MessageChat | null;
}

export interface SeenNotification {
    from: string;
    to: string;
    timestamp: string;
    type: string;
}

export interface OnlineNotification {
    from: string;
    timestamp: string;
    type: string;
}

export interface RawChat {
    body: string;
    timestamp?: string;
    seen: boolean;
    type: string;
    offset?: string;
}

export interface MessageChat extends RawChat {
    from: string;
    to: string;
    user: boolean;
}

export interface NotificationChat extends RawChat {
    friendRResponse?: FriendRequestResponse;
    relationShipResponse?: RelationShip;
    actionCode: number;
}

export interface SettingItem {
    icon: JSX.Element;
    title: string;
    children?: SettingItem[];
    onClick?: Function;
    to?: string;
}

export interface AddGroupRequest {
    nameGroup: string;
    urlAvatar: string;
    listUserID: string[];
}
