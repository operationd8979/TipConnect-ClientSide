import classNames from 'classnames/bind';
import Styles from './Live.module.scss';
import { useEffect, useRef, useState } from 'react';
import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import { useDispatch, useSelector } from 'react-redux';
import { MessageChat, State } from '../../type';
import { SocketService } from '../../apiService';
import { useNavigate, useParams } from 'react-router-dom';
import { connectSuccess } from '../../reducers';
import Button from '../../components/Button';
import { Send } from '../../components/Icons';

const cx = classNames.bind(Styles);

const servers = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ],
        },
    ],
};

let peerConnection: RTCPeerConnection;
let peerConnection2: RTCPeerConnection;

const WatchLive = () => {
    const [loading, setLoading] = useState(false);
    const { liveID } = useParams();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user, notifications, listRelationShip, i18n } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState(new MediaStream());

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [listMessage, setListMessage] = useState<{ name: string; content: string }[]>([]);
    const [valueChat, setValueChat] = useState('');
    const [message, setMessage] = useState<MessageChat | null>(null);
    const [candidate, setCandidate] = useState<RTCSessionDescription | null>(null);

    const [hostID, setHostID] = useState<string>('');
    const [friendID, setFriendID] = useState<string>('');

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            if (peerConnection2) {
                stream.getTracks().forEach((track) => {
                    console.log('send track');
                    const sender = peerConnection2.getSenders().find((s) => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        peerConnection2.addTrack(track, stream);
                    }
                });
            }
        }
    }, [stream]);

    useEffect(() => {
        if (candidate) {
            console.log('candidate');
            console.log(candidate);
            sendPrivateMassage(JSON.stringify(candidate), hostID);
        }
    }, [candidate]);

    useEffect(() => {
        if (hostID !== '') {
            if (peerConnection) {
                peerConnection.close();
            }
            peerConnection = new RTCPeerConnection(servers);
            peerConnection.ontrack = (event) => {
                console.log('get track');
                setStream(event.streams[0]);
            };
            peerConnection.onicecandidate = async (event) => {
                if (event.candidate) {
                    const sdp = peerConnection.localDescription;
                    if (sdp?.type === 'answer') setCandidate(peerConnection.localDescription);
                }
            };
            sendPrivateMassage('connect', hostID);
        }
    }, [hostID]);

    useEffect(() => {
        if (friendID !== '') {
            const handleOpenLineConnect = async () => {
                if (peerConnection2) {
                    peerConnection2.close();
                }
                peerConnection2 = new RTCPeerConnection(servers);
                stream.getTracks().forEach((track) => {
                    console.log('send track');
                    const sender = peerConnection2.getSenders().find((s) => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        peerConnection2.addTrack(track, stream);
                    }
                });
                const offer = await peerConnection2.createOffer();
                await peerConnection2.setLocalDescription(offer);
                sendPrivateMassage(JSON.stringify(offer), friendID);
            };
            handleOpenLineConnect();
        }
    }, [friendID]);

    const handleKeyEnter = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        setLoading(true);
        if (valueChat != '' && user) {
            sendLiveRequest(user.fullName + '@' + valueChat);
            setValueChat('');
            setListMessage([...listMessage, { name: user.fullName, content: valueChat }]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (message != null) {
            const handleLiveRequest = async () => {
                if (message.type === 'LIVE') {
                    switch (message.body) {
                        case 'host':
                            setHostID(message.from);
                            break;
                        case 'connect':
                            setFriendID(message.from);
                            break;
                        case 'off':
                            alert('Đóng stream!!!');
                            handleCloseCall();
                            break;
                        default:
                            const jsonData = JSON.parse(message.body);
                            if (jsonData.type === 'offer') {
                                if (peerConnection) {
                                    console.log('create answer');
                                    const offer = JSON.parse(message.body);
                                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                                    const answer = await peerConnection.createAnswer();
                                    await peerConnection.setLocalDescription(answer);
                                }
                                break;
                            }
                            if (jsonData.type === 'answer') {
                                if (peerConnection2) {
                                    if (
                                        peerConnection2.remoteDescription === null &&
                                        peerConnection2.currentRemoteDescription === null
                                    ) {
                                        try {
                                            await peerConnection2.setRemoteDescription(jsonData);
                                        } catch (error) {
                                            console.log('Error setRemoteDescription from answer: ' + error);
                                        }
                                    }
                                }
                                break;
                            }
                    }
                } else if (message.type === 'LIVECHAT') {
                    const chat = { name: message.from, content: message.body };
                    setListMessage([...listMessage, chat]);
                }
            };
            handleLiveRequest();
        }
    }, [message]);

    useEffect(() => {
        //KẾT NỐI WEBSOCKET
        if (user) {
            if (!stompClient.connected) {
                console.log('<<<<<<<<<<<<<<<<CONNECT WS>>>>>>>>>>>>>>>>');
                SocketService.connectStomp(socket, stompClient, user.userID).then((response) => {
                    const { socket, stompClient } = response;
                    stompClient.subscribe('/users/private', async function (message) {
                        try {
                            const data: MessageChat = JSON.parse(message.body);
                            setMessage(data);
                        } catch (error) {
                            console.log(error);
                        }
                    });
                    const chat: MessageChat = {
                        from: user?.userID || '',
                        to: liveID || '',
                        type: 'LIVE',
                        timestamp: new Date().getTime().toString(),
                        body: 'watch',
                        seen: false,
                        user: false,
                    };
                    stompClient.send('/app/live', JSON.stringify(chat));
                    dispatch(connectSuccess({ socket, stompClient }));
                });
            }
        }
        return () => {
            if (stompClient.connected) {
                SocketService.disconnectStomp(stompClient);
            }
        };
    }, []);

    function sendLiveRequest(body: string) {
        if (stompClient.connected && user) {
            const chat: MessageChat = {
                from: user.userID,
                to: liveID || '',
                type: 'LIVE',
                timestamp: new Date().getTime().toString(),
                body: body,
                seen: false,
                user: false,
            };
            stompClient.send('/app/live', JSON.stringify(chat));
        }
    }

    function sendPrivateMassage(body: string, to: string) {
        if (stompClient.connected) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: to,
                type: 'LIVE',
                timestamp: new Date().getTime().toString(),
                body: body,
                seen: false,
                user: true,
            };
            stompClient.send('/app/tradeLive', JSON.stringify(chat));
        }
    }

    const handleCloseCall = () => {
        sendLiveRequest('off-watch');
        window.close();
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('live-area')}>
                <div className={cx('video-area')}>
                    <video height={1280} width={720} ref={videoRef} muted autoPlay={true}></video>
                </div>
                <div className={cx('chat-area')}>
                    <div className={cx('message-area')}>
                        {listMessage.map((item, index) => {
                            return (
                                <div className={cx('message-wrapper')} key={index}>
                                    <span className={cx('message-name')}>{item.name}</span>
                                    <span className={cx('message-content')}>{item.content}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className={cx('send-area')}>
                        <div className={cx('send-input')}>
                            <textarea
                                spellCheck={false}
                                maxLength={500}
                                value={valueChat}
                                onChange={(e) => {
                                    if (e.target.value != '\n') setValueChat(e.target.value);
                                }}
                                onKeyDown={handleKeyEnter}
                            />
                        </div>
                        <div className={cx('send-button')}>
                            <Button primary large onClick={handleSendMessage} disabled={loading}>
                                <Send />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={cx('action-area')}>
                <Button primary onClick={handleCloseCall}>
                    Thoat
                </Button>
            </div>
        </div>
    );
};

export default WatchLive;
