import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

const StompProvider = () => {
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');

        const stompClient = Stomp.over(socket);
        console.log('stompClientzzzz: ');

        stompClient.connect({ userID: '123456' }, (frame) => {
            //console.log(frame);
            console.log(stompClient);
            // stompClient.subscribe('/users/private', function (message) {
            //     console.log('nhận tin nhắn private:');
            //     //console.log(message.body);
            // });
            // stompClient.subscribe('/all/messages', function (message) {
            //     console.log('nhận tin nhắn all:');
            //     //console.log(message.body);
            // });
        });

        return () => {
            stompClient.disconnect();
        };
    }, []);

    return <div>Hello</div>;
};

export default StompProvider;
