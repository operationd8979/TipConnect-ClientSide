import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import SockJS from 'sockjs-client';
import { useDispatch, useSelector } from 'react-redux';

// const currentUser = useSelector<any>((state) => state.UserReducer) as State;

// const connectPromise = (stomp: Client, userID: string) =>
//     new Promise<Client>((resolve) => {
//         console.log(stomp);
//         console.log(userID);
//         stomp.connect({ userID: userID }, (frame) => {
//             console.log(frame);
//             resolve(stomp);
//         });
//     });

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

export default { connectStomp, disconnectStomp };
