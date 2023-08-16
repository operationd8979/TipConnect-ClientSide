export interface User {
    accessToken: string;
    refreshToken: string;
}


export interface State {
    user: User
}

export interface Action {
    type: string;
    payload: string | number;
}

