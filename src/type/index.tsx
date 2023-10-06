export interface User {
    fullName: string;
    role: string;
    enable: boolean;
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

export interface AuthenticationReponse {
    code: number;
    user: User;
    message: string;
    error_message: string;
}

export interface State {
    isLoggedIn: boolean;
    user: User | null;
}
