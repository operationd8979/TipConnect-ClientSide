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
import { resolve } from 'path';
import { rejects } from 'assert';

const cx = classNames.bind(Styles);

const MessageArea = () => {
    const { friendId } = useParams();
    const [loading, setLoading] = useState(false);

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

    const [urlPhotos, setUrlPhotos] = useState<string[]>([]);
    const [showInputChat, setShowInputChat] = useState(true);
    const inputFile = useRef<HTMLInputElement>(null);

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

    const handleSendMessage = () => {
        if (urlPhotos.length > 0) {
            onSendPhoto();
        } else {
            onSendMessage();
        }
    };

    function onSendPhoto() {
        const copyPhotos = [...urlPhotos];
        for (let i = 0; i < copyPhotos.length; i++) {
            const url = copyPhotos[i];
            uploadImage(url).then((urlImage: string) => {
                onSendPrivate(urlImage, 'PHOTO');
                onDeletePhoto(i);
            });
        }
    }

    function onSendMessage() {
        if (bodyChat.length > 500) {
            alert('độ dài tin nhắn quá 500 ký tự!!!');
            return;
        }
        if (bodyChat !== '') onSendPrivate(bodyChat, 'MESSAGE');
    }

    function onSendPrivate(body: string, type: string) {
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
            handleSendMessage();
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

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const arrayUrl = [];
            for (let i = 0; i < event.target.files.length; i++) {
                console.log(event.target.files);
                const file: File = event.target.files[i];
                arrayUrl.push(URL.createObjectURL(file));
            }
            setUrlPhotos([...urlPhotos, ...arrayUrl]);
            if (showInputChat) {
                setShowInputChat(false);
            }
            event.target.value = '';
        }
    };

    const handleDeletePhoto = (index: number) => {
        const userConfirmed = window.confirm('Bạn có chắc muốn xóa ảnh?');
        if (userConfirmed) {
            onDeletePhoto(index);
        }
    };

    const onDeletePhoto = (index: number) => {
        URL.revokeObjectURL(urlPhotos[index]);
        const newUrlPhotos = urlPhotos.filter((url, i) => i !== index);
        setUrlPhotos(newUrlPhotos);
        return () => {
            if (urlPhotos.length === 0) {
                setShowInputChat(true);
            }
        };
    };

    const uploadImage = (previewUrl: string) => {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const ref = storageRef(storage, `UserArea/${user?.email}/images/${new Date().getTime()}.jpeg`);
                const fileData = await fetch(previewUrl);
                const bytes = await fileData.blob();
                const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
                const url: string = await getDownloadURL(snapshot.ref);
                resolve(url);
            } catch (error) {
                reject(error);
            }
        });
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
                                multiple
                                accept="image/png, image/jpeg"
                                onChange={(e) => onChangeFile(e)}
                            />
                            <PhotoItem />
                        </button>
                    </div>
                </div>
                <div className={cx('container-send')}>
                    <div className={cx('input-chat')}>
                        {!showInputChat && urlPhotos.length > 0 ? (
                            urlPhotos.map((urlPhoto, index) => {
                                return (
                                    <button key={index} onClick={() => handleDeletePhoto(index)}>
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
                        <Button primary large onClick={handleSendMessage}>
                            <Send />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageArea;
