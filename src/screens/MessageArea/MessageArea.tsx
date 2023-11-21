import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';
import {
    State,
    FriendRequestResponse,
    Response,
    AuthenticationReponse,
    RawChat,
    MessageChat,
    NotificationChat,
    FriendShip,
} from '../../type';
import { Client } from 'webstomp-client';
import Button from '../../components/Button';

const cx = classNames.bind(Styles);

const MessageArea = () => {
    const { friendId } = useParams();
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user, notifications, listFriend } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;

    const [bodyChat, setBodyChat] = useState('');

    const [friendShip, setFriendShip] = useState<FriendShip | undefined>(
        listFriend.find((f) => f.friend.userID === friendId),
    );

    useEffect(() => {}, [friendId]);

    function sendMessagePrivate() {
        if (stompClient) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                type: 'MESSAGE',
                body: bodyChat,
                seen: false,
            };
            stompClient.send('/app/private', JSON.stringify(chat));
            setBodyChat('');
        }
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('card-img')}>
                    <img src={friendShip?.friend.urlAvatar} alt={friendShip?.friend.fullName} />
                </div>
                <div className={cx('card-info')}>
                    <div className={cx('card-name')}>{friendShip?.friend.fullName}</div>
                    <div className={cx('card-detail')}>{friendShip?.type}</div>
                </div>
                <div className={cx('card-action')}>[CALL]/[CALL VIDEO]</div>
            </div>
            <div className={cx('message-area')}>
                <div style={{ flex: 1 }} />
                <div className={cx('wrapper-chat', 'friend-chat')}>
                    <div className={cx('chat-avatar')}>
                        <img src={friendShip?.friend.urlAvatar} alt={friendShip?.friend.fullName} />
                    </div>
                    <div className={cx('chat-content')}>
                        Hello, what your name! My profile send uou.Hello, what your name! My profile send uou.Hello,
                        what your name! My profile send uouHello, what your name! My profile send uouHello, what your
                        name! My profile send uou
                    </div>
                </div>
                <div className={cx('wrapper-chat', 'friend-chat')}>
                    <div className={cx('chat-avatar')}>
                        <img src={friendShip?.friend.urlAvatar} alt={friendShip?.friend.fullName} />
                    </div>
                    <div className={cx('chat-content')}>
                        Hello, what your name! My profile send uou.Hello, what your name! My profile send uou.Hello,
                        what your name! My profile send uouHello, what your name! My profile send uouHello, what your
                        name! My profile send uou
                    </div>
                </div>
                <div className={cx('wrapper-chat', 'friend-chat')}>
                    <div className={cx('chat-avatar')}>
                        <img src={friendShip?.friend.urlAvatar} alt={friendShip?.friend.fullName} />
                    </div>
                    <div className={cx('chat-content')}>
                        Hello, what your name! My profile send uou.Hello, what your name! My profile send uou.Hello,
                        what your name! My profile send uouHello, what your name! My profile send uouHello, what your
                        name! My profile send uou
                    </div>
                </div>
                <div className={cx('wrapper-chat', 'user-chat')}>
                    <div className={cx('chat-content')}>
                        Hello, what your name! My profile send uou.Hello, what your name! My profile send uou.Hello,
                        what your name! My profile send uouHello, what your name! My profile send uouHello, what your
                        name! My profile send uou
                    </div>
                    <div className={cx('chat-avatar')}>
                        <img src={user?.urlAvatar} alt={user?.fullName} />
                    </div>
                </div>
                <div className={cx('wrapper-chat', 'friend-chat')}>
                    <div className={cx('chat-avatar')}>
                        <img src={friendShip?.friend.urlAvatar} alt={friendShip?.friend.fullName} />
                    </div>
                    <div className={cx('chat-content')}>
                        Hello, what your name! My profile send uou.Hello, what your name! My profile send uou.Hello,
                        what your name! My profile send uouHello, what your name! My profile send uouHello, what your
                        name! My profile send uou
                    </div>
                </div>
            </div>
            <div className={cx('chat-area')}>
                <div className={cx('header-send')}> [xxxxICON]/[VIDEO]/[PICTURE]</div>
                <div className={cx('container-send')}>
                    <div className={cx('input-chat')}>
                        <input
                            spellCheck={false}
                            value={bodyChat}
                            onChange={(e) => {
                                setBodyChat(e.target.value);
                            }}
                        />
                    </div>
                    <div className={cx('button-chat')}>
                        <Button primary large onClick={sendMessagePrivate}>
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageArea;
