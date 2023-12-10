import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import SockJS from 'sockjs-client';
import { useDispatch, useSelector } from 'react-redux';
import { OnlineNotification, SeenNotification } from '../../type';

const connectStomp = (socket: WebSocket, stompClient: Client, userID: string) =>
    new Promise<{ socket: WebSocket; stompClient: Client }>((resolve) => {
        socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({ userID: userID }, (frame) => {
            resolve({ socket, stompClient });
        });
    });

const disconnectStomp = (stompClient: Client) =>
    new Promise<Client>((resolve) => {
        stompClient.disconnect(() => {
            resolve(stompClient);
        });
    });

const sendTradeMessage = (stompClient: Client, data: any) => {
    if (stompClient.connected) {
        stompClient.send('/app/tradeRTC', JSON.stringify(data));
    } else {
        console.log('Socket is not opened!');
    }
};

const sendPrivateMessage = (stompClient: Client, data: any) => {
    if (stompClient.connected) {
        stompClient.send('/app/private', JSON.stringify(data));
    } else {
        console.log('Socket is not opened!');
    }
};

const sendSeenNotification = (stompClient: Client, data: SeenNotification) => {
    if (stompClient.connected) {
        stompClient.send('/app/seen', JSON.stringify(data));
    } else {
        console.log('Socket is not opened!');
    }
};

const notifyOnline = (stompClient: Client, data: OnlineNotification) => {
    if (stompClient.connected) {
        stompClient.send('/app/online', JSON.stringify(data));
    } else {
        console.log('Socket is not opened!');
    }
};

export default {
    connectStomp,
    disconnectStomp,
    sendTradeMessage,
    sendPrivateMessage,
    sendSeenNotification,
    notifyOnline,
};
