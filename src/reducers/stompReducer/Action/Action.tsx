import stompReducerAction from './stompReducerAction';
import { Client } from 'webstomp-client';

export const connectSuccess = (payload: { socket: WebSocket; stompClient: Client }) => {
    return {
        type: stompReducerAction.CONNECT_SUCCESS,
        payload,
    };
};

export const connectFail = (payload: Client) => {
    return {
        type: stompReducerAction.CONNECT_FAIL,
        payload,
    };
};

export const disconnect = (payload: Client) => {
    return {
        type: stompReducerAction.DISCONNECT,
        payload,
    };
};
