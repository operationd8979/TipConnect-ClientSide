import { Action } from '../../type';
import actionTypes from './Action';
import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import SockJS from 'sockjs-client';

interface STOMP {
    Frame: Frame;
    VERSIONS: typeof VERSIONS;
    client: typeof client;
    over: typeof over;
}

const socket = new SockJS('http://localhost:8080/ws');
const initalStomp: Client = Stomp.over(socket);

const StompReducer = (
    state: { socket: WebSocket; stompClient: Client } = { socket, stompClient: initalStomp },
    action: Action,
) => {
    const { type, payload } = action;
    switch (type) {
        case actionTypes.CONNECT_SUCCESS:
            return payload;
        case actionTypes.CONNECT_FAIL:
        case actionTypes.DISCONNECT:
            return { ...state, stompClient: payload };
        default:
            return state;
    }
};

export default StompReducer;
