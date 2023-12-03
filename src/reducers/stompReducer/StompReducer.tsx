import { Action, StateWS } from '../../type';
import actionTypes from './Action';
import Stomp, { Client } from 'webstomp-client';
import SockJS from 'sockjs-client';

const socket = new SockJS('http://localhost:8080/ws');
const initalStomp: Client = Stomp.over(socket);

const StompReducer = (state: StateWS = { socket, stompClient: initalStomp, currentMessage: null }, action: Action) => {
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
