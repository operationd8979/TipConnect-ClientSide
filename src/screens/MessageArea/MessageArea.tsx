import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';
import HeadlessTippy from '@tippyjs/react/headless';
import { uploadBytes, getDownloadURL, storageRef, storage } from '../../firebase';

import Chat from './Chat';
import Button from '../../components/Button';
import { UserService } from '../../apiService';
import { getGifItems, updateLastMessage } from '../../reducers';
import { Call, GifItem, PhotoItem, Send, VideoCall } from '../../components/Icons';
import { State, StateWS, MessageChat, Gif } from '../../type';
import { Wrapper as PopperWrapper } from '../../components/Popper';

const cx = classNames.bind(Styles);

const urlGif =
    'https://firebasestorage.googleapis.com/v0/b/tipconnect-14d4b.appspot.com/o/ItemArea%2FGifItem%2Fz4929379162123_f289b1a32aba3b34477f53f0f7a326a8.gif?alt=media&token=cd4131ce-276d-474b-9682-19856da9aafa';

const MessageArea = () => {
    const { friendId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const messageAreaRef = useRef<HTMLDivElement>(null);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { user, listFriend, listGifItem } = currentUser;
    const { stompClient, currentMessage } = currentStomp;

    const [bodyChat, setBodyChat] = useState('');
    const friendShip = listFriend.find((f) => f.friend.userID === friendId);
    const [listMessage, setListMessage] = useState<MessageChat[]>([]);
    const [showGifTab, setShowGifTab] = useState(false);

    useEffect(() => {
        if (friendShip?.message) {
            let newMessage = friendShip.message;
            newMessage.seen = true;
            dispatch(updateLastMessage(newMessage));
        }
    }, []);

    useEffect(() => {
        const callApiGetMessages = async () => {
            try {
                const response = await UserService.getMessageChats(friendId || '');
                if (response?.ok) {
                    response.json().then((data) => {
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
                    let newMessage = currentMessage;
                    newMessage.seen = true;
                    dispatch(updateLastMessage(newMessage));
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

    function sendMessage() {
        if (bodyChat.length > 500) {
            alert('độ dài tin nhắn quá 500 ký tự!!!');
            return;
        }
        if (bodyChat !== '') sendMessagePrivate(bodyChat, 'MESSAGE');
    }

    function sendMessagePrivate(body: string, type: string) {
        if (stompClient.connected) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                body: body,
                type: type,
                seen: true,
                user: true,
            };
            stompClient.send('/app/private', JSON.stringify(chat));
            setListMessage((preList) => [...preList, chat]);
            setBodyChat('');
            dispatch(updateLastMessage(chat));
        }
    }

    const handleCall = async (type: string) => {
        window.open(
            `/call/${friendId}/${friendShip?.friend.fullName}/${type}/caller`,
            '_blank',
            'width=500,height=500',
        );
    };

    const handleClickIcon = () => {
        const callApiGetGifItems = async () => {
            try {
                const response = await UserService.getGifItems();
                if (response?.ok) {
                    response.json().then((data) => {
                        dispatch(getGifItems(data));
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
        if (listGifItem.length === 0) callApiGetGifItems();
        setShowGifTab(!showGifTab);
    };
    const handleClickPicture = () => {
        inputFile?.current?.click();
    };

    const handleHideGifTab = () => {
        setShowGifTab(false);
    };

    const handleKeyEnter = (e: any) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const onClickIcon = (url: string) => {
        if (stompClient.connected && url) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                type: 'GIF',
                body: url,
                seen: true,
                user: true,
            };
            stompClient.send('/app/private', JSON.stringify(chat));
            setListMessage((preList) => [...preList, chat]);
            dispatch(updateLastMessage(chat));
            handleHideGifTab();
        }
    };

    const [urlPhotos, setUrlPhotos] = useState<string[]>([]);
    const inputFile = useRef<HTMLInputElement>(null);
    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const file: File = event.target.files[i];
                setUrlPhotos([...urlPhotos, URL.createObjectURL(file)]);
            }
            event.target.value = '';
        }
    };

    const handleDeleteFile = (index: number) => {
        const userConfirmed = window.confirm('Bạn có chắc muốn xóa ảnh?');
        if (userConfirmed) {
            URL.revokeObjectURL(urlPhotos[index]);
            const newUrlPhotos = urlPhotos.filter((url, i) => i !== index);
            setUrlPhotos(newUrlPhotos);
        }
    };

    const uploadImage = async (previewUrl: string) => {
        try {
            const ref = storageRef(storage, `UserArea/${user?.email}/images/${new Date().getTime()}.jpeg`);
            const fileData = await fetch(previewUrl);
            const bytes = await fileData.blob();
            const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.log(error);
            return null;
        }
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
                    <button onClick={() => handleCall('call')}>
                        <Call />
                    </button>
                    <button onClick={() => handleCall('video')}>
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
                            type={message.type}
                        />
                    );
                })}
            </div>
            <div className={cx('chat-area')}>
                <div className={cx('header-send')}>
                    <div className={cx('header-send-icon')}>
                        <HeadlessTippy
                            visible={showGifTab}
                            interactive
                            onClickOutside={handleHideGifTab}
                            render={(attrs) => (
                                <div className={cx('gif-area')} tabIndex={-1} {...attrs}>
                                    <>
                                        <h4 className={cx('gif-title')}>Danh sách gif</h4>
                                        <div className={cx('gif-data')}>
                                            {listGifItem.map((gifItem: Gif) => {
                                                const { gifID, gifName, url } = gifItem;
                                                return (
                                                    <div className={cx('gif-item')} key={gifID}>
                                                        <button onClick={() => onClickIcon(url)}>
                                                            <img src={gifItem.url} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                </div>
                            )}
                        >
                            <button onClick={handleClickIcon}>
                                <GifItem />
                            </button>
                        </HeadlessTippy>
                    </div>
                    <div className={cx('header-send-picture')}>
                        <button onClick={handleClickPicture}>
                            <input
                                type="file"
                                id="image_uploads"
                                ref={inputFile}
                                style={{ display: 'none' }}
                                accept="image/png, image/jpeg"
                                onChange={(e) => onChangeFile(e)}
                            />
                            <PhotoItem />
                        </button>
                    </div>
                </div>
                <div className={cx('container-send')}>
                    <div className={cx('input-chat')}>
                        {urlPhotos.length > 0 ? (
                            urlPhotos.map((urlPhoto, index) => {
                                return (
                                    <button key={index} onClick={() => handleDeleteFile(index)}>
                                        <img src={urlPhoto} />
                                    </button>
                                );
                            })
                        ) : (
                            <input
                                spellCheck={false}
                                maxLength={500}
                                value={bodyChat}
                                onChange={(e) => {
                                    setBodyChat(e.target.value);
                                }}
                                onKeyDown={handleKeyEnter}
                            />
                        )}
                    </div>
                    <div className={cx('button-chat')}>
                        <Button primary large onClick={sendMessage}>
                            <Send />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageArea;
