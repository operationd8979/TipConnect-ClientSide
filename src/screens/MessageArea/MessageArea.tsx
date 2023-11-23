import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';
import {
    State,
    StateWS,
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
import { updateLastMessage } from '../../reducers';
import { UserService } from '../../apiService';
import Chat from './Chat';
import { Call, VideoCall } from '../../components/Icons';

const cx = classNames.bind(Styles);

const MessageArea = () => {
    const { friendId } = useParams();
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { isLoggedIn, user, notifications, listFriend } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient, currentMessage } = currentStomp;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const messageAreaRef = useRef<HTMLDivElement>(null);
    const [bodyChat, setBodyChat] = useState('');

    const friendShip = listFriend.find((f) => f.friend.userID === friendId);
    const [listMessage, setListMessage] = useState<MessageChat[]>([]);

    const handleAddMessage = useCallback(() => {
        if (currentMessage) {
            if (currentMessage.from === friendId) {
                if (
                    listMessage.length === 0 ||
                    currentMessage.timestamp !== listMessage[listMessage.length - 1].timestamp
                ) {
                    console.log('[2]');
                    setListMessage((prevList) => [...prevList, currentMessage]);
                }
            }
        }
    }, [currentMessage]);

    useEffect(() => {
        handleAddMessage();
    }, [handleAddMessage]);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [listMessage]);

    useEffect(() => {
        const callApiGetMessages = async () => {
            try {
                const response = await UserService.getMessageChats(friendId || '');
                if (response?.ok) {
                    response.json().then((data) => {
                        console.log(data);
                        setListMessage(data);
                    });
                } else {
                    if (response === null || response?.status == 403) {
                        console.log('get fail');
                    }
                }
            } catch (error) {
                alert(error);
                console.log(error);
            }
        };
        if (listMessage.length == 0) {
            callApiGetMessages();
        }
    }, [friendId]);

    function sendMessagePrivate() {
        if (stompClient) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                type: 'MESSAGE',
                body: bodyChat,
                seen: false,
                user: true,
            };
            stompClient.send('/app/private', JSON.stringify(chat));
            setListMessage((preList) => [...preList, chat]);
            dispatch(updateLastMessage(chat));
            setBodyChat('');
        }
    }

    const handleCall = async () => {
        window.open(`/call/${friendId}/${friendShip?.friend.fullName}/call`, '_blank', 'width=500,height=500');

        // const servers = {
        //     iceServers: [
        //         {
        //             urls: [
        //                 'stun:stun.l.google.com:19302',
        //                 'stun:stun1.l.google.com:19302',
        //                 'stun:stun2.l.google.com:19302',
        //                 'stun:stun3.l.google.com:19302',
        //                 'stun:stun4.l.google.com:19302',
        //             ],
        //         },
        //     ],
        // };
        // const peerConnection = new RTCPeerConnection(servers);

        // peerConnection.ondatachannel = (event) => {
        //     const receiveChannel = event.channel;
        //     receiveChannel.onmessage = (e) => {
        //         console.log('Received Message:', e.data);
        //     };
        // };

        // const dataChannel = peerConnection.createDataChannel('dataChannel');
        // dataChannel.onopen = () => {
        //     dataChannel.send('Hello, world!');
        // };

        // peerConnection.onicecandidate = async (event) => {
        //     if (event.candidate) {
        //         console.log('New ICE cecandiate', event.candidate);
        //     }
        // };

        // let offer = await peerConnection.createOffer();
        // await peerConnection.setLocalDescription(offer);
        // console.log(offer);
    };

    const handleCallVideo = () => {
        window.open(`/call/${friendId}/${friendShip?.friend.fullName}/video`, '_blank', 'width=500,height=500');
    };

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
                <div className={cx('card-action')}>
                    <button onClick={handleCall}>
                        <Call />
                    </button>
                    <button onClick={handleCallVideo}>
                        <VideoCall />
                    </button>
                </div>
            </div>
            <div className={cx('message-area')} ref={messageAreaRef}>
                <div style={{ flex: 1 }} />
                {listMessage.map((message, index) => {
                    return (
                        <Chat
                            key={index}
                            fullName={
                                message.user
                                    ? user
                                        ? user.fullName
                                        : ''
                                    : friendShip
                                    ? friendShip.friend.fullName
                                    : ''
                            }
                            urlAvatar={
                                message.user
                                    ? user
                                        ? user.urlAvatar
                                        : ''
                                    : friendShip
                                    ? friendShip.friend.urlAvatar
                                    : ''
                            }
                            content={message.body}
                            isUser={message.user}
                            seen={message.seen}
                        />
                    );
                })}
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
