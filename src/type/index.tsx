export interface User {
    accessToken: string;
    refreshToken: string;
}

export interface State {
    user: User;
}

export interface Action {
    type: string;
    payload: string | number;
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
