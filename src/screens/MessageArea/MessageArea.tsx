import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './MessageArea.module.scss';
import HeadlessTippy from '@tippyjs/react/headless';
import { uploadBytes, getDownloadURL, storageRef, storage } from '../../firebase';
import { useDropzone } from 'react-dropzone';

import Chat from './Chat';
import Button from '../../components/Button';
import { SocketService, UserService } from '../../apiService';
import { getGifItems, updateLastMessage, updateFriendShip } from '../../reducers';
import {
    ArrowBack,
    ArrowTo,
    Call,
    EditItem,
    FileItem,
    GifItem,
    LocationItem,
    Send,
    TagItem,
    VideoCall,
} from '../../components/Icons';
import { State, StateWS, MessageChat, Gif, RawChat, SeenNotification } from '../../type';
import { pathImage } from '../../contants';
import hardData from '../../contants/hardData';
import Map from '../../components/Map';

const cx = classNames.bind(Styles);

const TypeFile = {
    pdf: 'application/pdf',
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    msWord: 'application/msword',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpeg: 'image/jpeg',
    png: 'image/png',
};

let currentHeightChat = 0;

const MessageArea = () => {
    const { relationShipID } = useParams();

    const dispatch = useDispatch();

    const messageAreaRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);
    const inputFile = useRef<HTMLInputElement>(null);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { user, listRelationShip, listGifItem, i18n } = currentUser;
    const { stompClient } = currentStomp;
    const relationShip = listRelationShip.find((r) => r.id === relationShipID);

    const [listMessage, setListMessage] = useState<MessageChat[]>([]);
    const [currentMessage, setCurrentMessage] = useState<MessageChat | null>(null);
    const [seenGet, setSeenGet] = useState<SeenNotification | null>(null);
    const [bodyChat, setBodyChat] = useState('');

    const [loading, setLoading] = useState(false);
    const [showGifTab, setShowGifTab] = useState(false);
    const [showInputChat, setShowInputChat] = useState(true);

    const [currentOffset, setCurrentOffset] = useState('');
    const [isEnd, setIsEnd] = useState(false);
    const [urlFiles, setUrlFiles] = useState<{ name: string; type: string; url: string }[]>([]);

    useEffect(() => {
        if (stompClient.connected) {
            console.log('subcribe');
            stompClient.subscribe('/users/private', function (message) {
                try {
                    const data = JSON.parse(message.body);
                    switch (data.type) {
                        case hardData.typeMessage.MESSAGE.name:
                        case hardData.typeMessage.PHOTO.name:
                        case hardData.typeMessage.GIF.name:
                        case hardData.typeMessage.PDF.name:
                        case hardData.typeMessage.WORD.name:
                        case hardData.typeMessage.EXCEL.name:
                        case hardData.typeMessage.ENDCALL.name:
                        case hardData.typeMessage.GEO.name:
                            setCurrentMessage(data as MessageChat);
                            dispatch(updateLastMessage(data as MessageChat));
                            break;
                        case hardData.typeMessage.SEEN.name:
                            setSeenGet(data as SeenNotification);
                            break;
                        default:
                            console.log(data);
                    }
                } catch (error) {
                    alert('Some message lost!');
                }
            });
        }
    }, [stompClient]);

    useEffect(() => {
        const callApiGetGifItems = async () => {
            try {
                const response = await UserService.getGifItems();
                if (response?.ok) {
                    response.json().then((data) => {
                        dispatch(getGifItems(data));
                    });
                } else {
                    if (response === null || response?.status === 403) {
                        console.log('get fail');
                    }
                }
            } catch (error) {
                alert(error);
                console.log(error);
            }
        };
        if (listGifItem.length === 0) callApiGetGifItems();
    }, []);

    useEffect(() => {
        setShowDetail(false);
        setShowGifTab(false);
        setListMessage([]);
        setCurrentOffset('');
        setListMediaFile([]);
        setCurrentMessage(null);
        callApiGetMessages(relationShipID || '', '', 20);
    }, [relationShipID]);

    useEffect(() => {
        if (currentMessage && currentMessage.to === relationShipID) {
            if (
                listMessage.length === 0 ||
                currentMessage.timestamp !== listMessage[listMessage.length - 1].timestamp
            ) {
                setListMessage((prevList) => [...prevList, currentMessage]);
                let newMessage = currentMessage;
                newMessage.seen = true;
                if (currentMessage.type !== hardData.typeMessage.ENDCALL.name && currentMessage.from !== user?.userID) {
                    const seenNotification: SeenNotification = {
                        from: currentMessage.from,
                        to: currentMessage.to,
                        type: hardData.typeMessage.SEEN.name,
                        timestamp: currentMessage.timestamp || new Date().getTime().toString(),
                    };
                    onSendSeenNotification(seenNotification);
                }
                dispatch(updateLastMessage(newMessage));
            }
        }
    }, [currentMessage]);

    useEffect(() => {
        if (seenGet) {
            if (seenGet.from === user?.userID) {
                const message = listMessage.filter(
                    (m) => m.from === seenGet.from && m.to === seenGet.to && m.timestamp === seenGet.timestamp,
                )[0];
                message.seen = true;
                const newListMessage = [...listMessage];
                setListMessage(newListMessage);
            }
        }
    }, [seenGet]);

    const callApiGetMessages = useCallback(
        async (friendId: string, offset: string, limit: number) => {
            try {
                const response = await UserService.getMessageChats(friendId, offset, limit);
                console.log(response);
                if (response?.ok) {
                    response.json().then((data: any) => {
                        console.log(data);
                        if (data[0]) {
                            setCurrentOffset(data[0].offset || '');
                        } else {
                            setIsEnd(true);
                        }
                        if (listMessage.length > 0) setListMessage((prevList) => [...data, ...prevList]);
                        else setListMessage(data);
                    });
                } else {
                    if (response === null || response?.status === 403) {
                        console.log('get fail');
                    }
                }
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        [listMessage],
    );

    const handleScroll = useCallback(() => {
        if (messageAreaRef.current) {
            if (messageAreaRef.current.scrollTop === 0 && !isEnd) {
                callApiGetMessages(relationShipID || '', currentOffset, 20);
            }
        }
    }, [callApiGetMessages, isEnd, currentOffset, relationShipID]);

    useEffect(() => {
        if (messageAreaRef.current) {
            const refMessage = messageAreaRef.current;
            messageAreaRef.current.addEventListener('scroll', handleScroll);
            return () => {
                refMessage.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]);

    useEffect(() => {
        if (messageAreaRef.current) {
            if (messageAreaRef.current.scrollTop === 0) {
                messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight - currentHeightChat;
            } else {
                messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
            }
            currentHeightChat = messageAreaRef.current.scrollHeight;
        }
    }, [listMessage]);

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0 && !loading) {
            addFile(acceptedFiles);
        }
    };

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            addFile(event.target.files);
            event.target.value = '';
            event.target.files = null;
        }
    };

    const addFile = (listFile: FileList | File[]) => {
        const arrayUrl = [];
        for (let i = 0; i < listFile.length; i++) {
            const file: File = listFile[i];
            if (!Object.values(TypeFile).includes(file.type)) {
                console.log('TYPE OF FILE IS NOT SUPPORTED!');
                continue;
            }
            arrayUrl.push({ name: file.name, type: file.type, url: URL.createObjectURL(file) });
        }
        setUrlFiles([...urlFiles, ...arrayUrl]);
        if (showInputChat) {
            setShowInputChat(false);
        }
    };

    const handleClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
    };
    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleSendMessage = () => {
        if (urlFiles.length > 0) {
            onSendFiles();
        } else {
            onSendMessage();
        }
        if (chatInputRef.current) chatInputRef.current.focus();
    };

    async function onSendFiles() {
        setLoading(true);
        for (let i = 0; i < urlFiles.length; i++) {
            const urlFile = urlFiles[i];
            if (urlFile.type === TypeFile.jpeg || urlFile.type === TypeFile.png) {
                const url = await uploadImage(urlFile.url);
                onSendPrivate(url, 'PHOTO');
            } else {
                const url = await uploadFile(urlFile.name, urlFile.url, urlFile.type);
                let type = 'FILE';
                switch (urlFile.type) {
                    case TypeFile.msWord:
                    case TypeFile.word:
                        type = hardData.typeMessage.WORD.name;
                        break;
                    case TypeFile.excel:
                        type = hardData.typeMessage.EXCEL.name;
                        break;
                    case TypeFile.pdf:
                        type = hardData.typeMessage.PDF.name;
                        break;
                    default:
                }
                onSendPrivate(url, type);
            }
        }
        setLoading(false);
        onDeleteUrlFiles();
    }

    function onSendMessage() {
        if (bodyChat.length > 500) {
            alert('500!!!');
            return;
        }
        if (bodyChat !== '') onSendPrivate(bodyChat, hardData.typeMessage.MESSAGE.name);
    }

    function onSendSeenNotification(seenNotification: SeenNotification) {
        SocketService.sendSeenNotification(stompClient, seenNotification);
    }

    const handleCall = async (type: string) => {
        window.open(`/call/${relationShipID}/${relationShip?.name}/${type}/caller`, '_blank', 'width=500,height=500');
    };

    const handleClickPicture = () => {
        inputFile?.current?.click();
    };
    const handleKeyEnter = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const onClickIcon = (url: string) => {
        onSendPrivate(url, hardData.typeMessage.GIF.name);
        setShowGifTab(false);
    };

    const handleClickPhotoPreview = (index: number) => {
        const userConfirmed = window.confirm('Bạn có chắc muốn xóa file?');
        if (userConfirmed) {
            onDeleteUrlFile(index);
        }
    };

    const onDeleteUrlFiles = () => {
        if (urlFiles.length > 0) {
            urlFiles.map((urlFile) => {
                URL.revokeObjectURL(urlFile.type);
            });
            setUrlFiles([]);
            setShowInputChat(true);
        }
    };

    const onDeleteUrlFile = (index: number) => {
        URL.revokeObjectURL(urlFiles[index].url);
        const newUrlPhotos = urlFiles.filter((url, i) => i !== index);
        setUrlFiles(newUrlPhotos);
        return () => {
            if (urlFiles.length === 0) {
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

    const uploadFile = (fileName: string, previewUrl: string, type: string) => {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const ref = storageRef(storage, `UserArea/${user?.email}/files/${fileName}`);
                const fileData = await fetch(previewUrl);
                const bytes = await fileData.blob();
                const snapshot = await uploadBytes(ref, bytes, { contentType: type });
                const url: string = await getDownloadURL(snapshot.ref);
                resolve(url);
            } catch (error) {
                reject(error);
            }
        });
    };

    const [showTypeTab, setShowTypeTab] = useState(false);
    const handleClickType = (code: number) => {
        if (relationShip) {
            if (relationShip.type !== hardData.typeFriendShip[code - 1].name) {
                const response = UserService.changeTypeFriendShip(
                    relationShipID || '',
                    hardData.typeFriendShip[code - 1].name,
                );
                relationShip.type = hardData.typeFriendShip[code - 1].name;
                dispatch(updateFriendShip(relationShip));
                setShowTypeTab(false);
            }
        }
    };

    const handleShareLocation = () => {
        if ('geolocation' in navigator) {
            const userConfirmation = window.confirm(i18n.t('MESSAGE_AREA_geo_ask'));
            if (userConfirmation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    onSendPrivate(
                        position.coords.latitude + '@' + position.coords.longitude,
                        hardData.typeMessage.GEO.name,
                    );
                });
            }
        } else {
            console.log('Geolocation is not available in your browser.');
        }
    };

    function onSendPrivate(body: string, type: string) {
        const chat: MessageChat = {
            from: user?.userID || '',
            to: relationShipID || '',
            body: body,
            timestamp: new Date().getTime().toString(),
            type: type,
            seen: false,
            user: true,
        };
        SocketService.sendPrivateMessage(stompClient, chat);
        setListMessage((preList) => [...preList, chat]);
        if (type === hardData.typeMessage.MESSAGE.name) {
            setBodyChat('');
        }
        dispatch(updateLastMessage(chat));
    }

    const [showDetail, setShowDetail] = useState(false);
    const [listMediaFile, setListMediaFile] = useState<MessageChat[]>([]);

    const handleOpenShowDetailRelationShip = async () => {
        if (!showDetail && listMediaFile.length === 0) {
            if (relationShipID) {
                const response = await UserService.getAllMediaFiles(relationShipID);
                if (response?.ok) {
                    response.json().then((data) => {
                        console.log(data);
                        setListMediaFile(data);
                    });
                }
            }
        }
        setShowDetail(!showDetail);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('card-img')}>
                    <img src={relationShip?.urlPic} alt={relationShip?.name} />
                </div>
                <div className={cx('card-info')}>
                    <div className={cx('card-name')}>{relationShip?.name}</div>
                    <div className={cx('card-detail')}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {relationShip?.type}
                            <div className={cx('change-type')}>
                                <HeadlessTippy
                                    placement="right"
                                    visible={showTypeTab}
                                    interactive
                                    onClickOutside={() => {
                                        setShowTypeTab(false);
                                    }}
                                    render={(attrs) => (
                                        <div className={cx('type-area')} tabIndex={-1} {...attrs}>
                                            <h4 className={cx('type-title')}>
                                                <TagItem />
                                                Type
                                            </h4>
                                            <div className={cx('type-data')}>
                                                {hardData.typeFriendShip.map((type: { code: number; name: string }) => {
                                                    const { code, name } = type;
                                                    return (
                                                        <div
                                                            className={cx('type-item', {
                                                                selectedType: relationShip?.type === name,
                                                                nonSelectType: relationShip?.type !== name,
                                                            })}
                                                            key={code}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    handleClickType(code);
                                                                }}
                                                            >
                                                                {name}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                >
                                    <button
                                        onClick={() => {
                                            setShowTypeTab(!showTypeTab);
                                        }}
                                    >
                                        <EditItem />
                                    </button>
                                </HeadlessTippy>
                            </div>
                        </div>
                    </div>
                </div>
                {!relationShip?.isGroup && (
                    <div className={cx('card-action')}>
                        <button onClick={() => handleCall('call')}>
                            <Call />
                        </button>
                        <button onClick={() => handleCall('video')}>
                            <VideoCall />
                        </button>
                    </div>
                )}
            </div>
            <div className={cx('message-area')}>
                <div className={cx('message-wrapper')} ref={messageAreaRef}>
                    <div style={{ flex: 1 }} />
                    {isEnd && <div className={cx('last-message')}>{i18n.t('MESSAGE_AREA_last_message')}</div>}
                    {listMessage.map((message, index) => {
                        let sender = null;
                        if (relationShip) {
                            sender = relationShip.friends.filter((f) => f.userID === message.from)[0] || user;
                        }
                        if (user && sender)
                            return (
                                <Chat
                                    key={index}
                                    fullName={message.user ? user.fullName : sender.fullName}
                                    urlAvatar={message.user ? user.urlAvatar : sender.urlAvatar}
                                    content={message.body}
                                    isUser={message.user}
                                    seen={message.seen}
                                    type={message.type}
                                    isLast={index === listMessage.length - 1}
                                />
                            );
                        else {
                            return <div>mat du lieu</div>;
                        }
                    })}
                </div>
                <div className={cx('message-detail-show-area')}>
                    <button onClick={handleOpenShowDetailRelationShip}>
                        {showDetail ? <ArrowTo /> : <ArrowBack />}
                    </button>
                </div>
                {showDetail && (
                    <div className={cx('message-detail-area')}>
                        {relationShip?.isGroup && (
                            <div className={cx('message-detail-wrapper')}>
                                <div className={cx('message-detail-header')}>
                                    <p>Thành viên trong nhóm</p>
                                </div>
                                <div className={cx('message-detail-content')}>
                                    {relationShip.friends.map((friend, index) => {
                                        return (
                                            <div className={cx('message-detail-content-group-member')} key={index}>
                                                <div className={cx('message-detail-content-group-member-img')}>
                                                    <img src={friend.urlAvatar} />
                                                </div>
                                                <div className={cx('message-detail-content-group-member-name')}>
                                                    {friend.fullName}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className={cx('message-detail-wrapper')}>
                            <div className={cx('message-detail-header')}>
                                <p>Tệp tin đa phương tiện</p>
                            </div>
                            <div className={cx('message-detail-content')}>
                                <div className={cx('message-detail-media-file-wrapper')}>
                                    {listMediaFile.map((mediaFile, index) => {
                                        return (
                                            <div className={cx('message-detail-media-file')} key={index}>
                                                <a href={mediaFile.body} target="_blank">
                                                    {mediaFile.type === hardData.typeMessage.PHOTO.name && (
                                                        <img src={mediaFile.body} alt={mediaFile.body} />
                                                    )}
                                                    {mediaFile.type === hardData.typeMessage.PDF.name && (
                                                        <iframe title="pdf" src={mediaFile.body} />
                                                    )}
                                                    {mediaFile.type === hardData.typeMessage.WORD.name && (
                                                        <img src={pathImage.wordFile} alt={mediaFile.body} />
                                                    )}
                                                    {mediaFile.type === hardData.typeMessage.EXCEL.name && (
                                                        <img src={pathImage.excelFile} alt={mediaFile.body} />
                                                    )}
                                                    {mediaFile.body.substring(113, 150)}
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className={cx('chat-area')}>
                <div className={cx('header-send')}>
                    <div className={cx('header-send-icon')}>
                        <HeadlessTippy
                            visible={showGifTab}
                            interactive
                            onClickOutside={() => setShowGifTab(false)}
                            render={(attrs) => (
                                <div className={cx('gif-area')} tabIndex={-1} {...attrs}>
                                    <h4 className={cx('gif-title')}>{i18n.t('MESSAGE_AREA_list_gif')}</h4>
                                    <div className={cx('gif-data')}>
                                        {listGifItem.map((gifItem: Gif) => {
                                            const { gifID, gifName, url } = gifItem;
                                            return (
                                                <div className={cx('gif-item')} key={gifID}>
                                                    <button onClick={() => onClickIcon(url)}>
                                                        <img src={gifItem.url} alt={gifName} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        >
                            <button onClick={() => setShowGifTab(!showGifTab)}>
                                <GifItem />
                            </button>
                        </HeadlessTippy>
                    </div>
                    <div className={cx('header-send-picture')}>
                        <button onClick={handleClickPicture} disabled={loading}>
                            <input
                                type="file"
                                id="image_uploads"
                                ref={inputFile}
                                style={{ display: 'none' }}
                                multiple
                                onChange={(e) => onChangeFile(e)}
                            />
                            <FileItem />
                        </button>
                    </div>
                    <div className={cx('header-send-location')}>
                        <button onClick={handleShareLocation} disabled={loading}>
                            <LocationItem />
                        </button>
                    </div>
                </div>
                <div
                    className={cx('container-send')}
                    {...getRootProps({
                        onClick: handleClick,
                        onKeyDown: handleKeyDown,
                        tabIndex: 0,
                        role: 'button',
                    })}
                >
                    <div className={cx('input-chat')}>
                        {!showInputChat && urlFiles.length > 0 ? (
                            urlFiles.map((urlFile, index) => {
                                return (
                                    <button key={index} onClick={() => handleClickPhotoPreview(index)}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {(urlFile.type === TypeFile.jpeg || urlFile.type === TypeFile.png) && (
                                                <img src={urlFile.url} alt={urlFile.name} />
                                            )}
                                            {urlFile.type === TypeFile.pdf && <iframe title="pdf" src={urlFile.url} />}
                                            {(urlFile.type === TypeFile.word || urlFile.type === TypeFile.msWord) && (
                                                <img src={pathImage.wordFile} alt={urlFile.name} />
                                            )}
                                            {urlFile.type === TypeFile.excel && (
                                                <img src={pathImage.excelFile} alt={urlFile.name} />
                                            )}
                                            {urlFile.name.substring(0, 10)}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <input
                                ref={chatInputRef}
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
                        <Button primary large onClick={handleSendMessage} disabled={loading}>
                            <Send />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageArea;
