import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';

import Chat from './Chat';
import Button from '../../components/Button';
import { UserService } from '../../apiService';
import { updateLastMessage } from '../../reducers';
import { Call, VideoCall } from '../../components/Icons';
import { State, StateWS, MessageChat } from '../../type';

const cx = classNames.bind(Styles);

const MessageArea = () => {
    const { friendId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const messageAreaRef = useRef<HTMLDivElement>(null);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { user, listFriend } = currentUser;
    const { stompClient, currentMessage } = currentStomp;

    const [bodyChat, setBodyChat] = useState('');
    const friendShip = listFriend.find((f) => f.friend.userID === friendId);
    const [listMessage, setListMessage] = useState<MessageChat[]>([]);

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
        if (listMessage.length === 0) {
            callApiGetMessages();
        }
    }, [friendId]);

    const handleAddMessage = useCallback(() => {
        if (currentMessage) {
            if (currentMessage.from === friendId) {
                if (
                    listMessage.length === 0 ||
                    currentMessage.timestamp !== listMessage[listMessage.length - 1].timestamp
                ) {
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

    function sendMessagePrivate() {
        if (bodyChat.length > 500) {
            alert('độ dài tin nhắn quá 500 ký tự!!!');
            return;
        }
        if (stompClient.connected && bodyChat !== '') {
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

    function callPrivate(type: string) {
        if (stompClient && user) {
            const tinyUser = {
                fullName: user.fullName,
                urlAvatar: user.urlAvatar,
                type: type,
            };
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                type: 'CALL',
                body: JSON.stringify(tinyUser),
                seen: false,
                user: true,
            };
            stompClient.send('/app/private', JSON.stringify(chat));
        }
    }

    const handleCall = async () => {
        window.open(`/call/${friendId}/${friendShip?.friend.fullName}/call/caller`, '_blank', 'width=500,height=500');
        callPrivate('call');
    };

    const handleCallVideo = () => {
        window.open(`/call/${friendId}/${friendShip?.friend.fullName}/video/caller`, '_blank', 'width=500,height=500');
        callPrivate('video');
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
                {/* <div className={cx('header-send')}> [xxxxICON]/[VIDEO]/[PICTURE]</div> */}
                <div className={cx('container-send')}>
                    <div className={cx('input-chat')}>
                        <input
                            spellCheck={false}
                            maxLength={500}
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
