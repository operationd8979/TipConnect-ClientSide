export interface User {
    userId: string;
    fullName: string;
    role: string;
    urlAvatar: string;
    enable: boolean;
}

export interface FriendShip {
    id: string;
    friend: User;
    type: string;
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

export interface State {
    isLoggedIn: boolean;
    user: User | null;
    listFriend: FriendShip[] | null;
}
