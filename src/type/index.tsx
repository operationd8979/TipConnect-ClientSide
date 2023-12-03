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

export interface FriendShip {
    id: string;
    friend: User;
    type: string;
    message?: MessageChat;
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
    messages: any;
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
    listFriend: FriendShip[];
    listGifItem: Gif[];
    notifications: Notifications;
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
    friendShipRespone?: FriendShip;
    actionCode: number;
}
