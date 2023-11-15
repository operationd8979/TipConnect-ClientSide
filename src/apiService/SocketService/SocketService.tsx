import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import SockJS from 'sockjs-client';

// const connectPromise = (stomp: Client, userID: string) =>
//     new Promise<Client>((resolve) => {
//         console.log(stomp);
//         console.log(userID);
//         stomp.connect({ userID: userID }, (frame) => {
//             console.log(frame);
//             resolve(stomp);
//         });
//     });

const connectStomp = (stomp: Client, userID: string) =>
    new Promise<Client>((resolve) => {
        const socket = new SockJS('http://localhost:8080/ws');
        stomp = Stomp.over(socket);
        stomp.connect({ userID: userID }, (frame) => {
            resolve(stomp);
        });
    });

const disconnectStomp = (stomp: Client) =>
    new Promise<Client>((resolve) => {
        stomp.disconnect(() => {
            resolve(stomp);
        });
    });

export default { connectStomp, disconnectStomp };
