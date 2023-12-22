import classNames from 'classnames/bind';
import Styles from './Live.module.scss';
import { useEffect, useRef, useState } from 'react';
import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import { useDispatch, useSelector } from 'react-redux';
import { MessageChat, State } from '../../type';
import { SocketService, UserService } from '../../apiService';
import { useNavigate } from 'react-router-dom';
import { connectSuccess } from '../../reducers';
import Button from '../../components/Button';

const cx = classNames.bind(Styles);

const servers = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                // 'stun:stun4.l.google.com:19302',
            ],
        },
    ],
};

let peerConnection: RTCPeerConnection;

const Live = () => {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user, notifications, listRelationShip, i18n } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalSteram] = useState(new MediaStream());

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [message, setMessage] = useState<MessageChat | null>(null);

    const [friendID, setFriendID] = useState<string>('');

    useEffect(() => {
        if (message != null) {
            const handleLiveRequest = async () => {
                if (message.type === 'LIVE') {
                    switch (message.body) {
                        case 'connect':
                            setFriendID(message.from);
                            break;
                        default:
                            const jsonData = JSON.parse(message.body);
                            if (jsonData.type === 'answer') {
                                if (peerConnection) {
                                    if (
                                        peerConnection.remoteDescription === null &&
                                        peerConnection.currentRemoteDescription === null
                                    ) {
                                        try {
                                            await peerConnection.setRemoteDescription(jsonData);
                                        } catch (error) {
                                            console.log('Error setRemoteDescription from answer: ' + error);
                                        }
                                    }
                                }
                                break;
                            }
                    }
                }
            };
            handleLiveRequest();
        }
    }, [message]);

    useEffect(() => {
        if (friendID !== '') {
            const handleOpenLineConnect = async () => {
                if (peerConnection) {
                    peerConnection.close();
                }
                peerConnection = new RTCPeerConnection(servers);
                localStream.getTracks().forEach((track) => {
                    console.log('send track');
                    const sender = peerConnection.getSenders().find((s) => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        peerConnection.addTrack(track, localStream);
                    }
                });
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                sendPrivateMassage(JSON.stringify(offer), friendID);
            };
            handleOpenLineConnect();
        }
    }, [friendID]);

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
                            alert(error);
                        }
                    });
                    const chat: MessageChat = {
                        from: user?.userID || '',
                        to: '',
                        type: 'LIVE',
                        timestamp: new Date().getTime().toString(),
                        body: 'live',
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

    useEffect(() => {
        const config = { audio: false, video: true };
        navigator.mediaDevices.getUserMedia(config).then((stream) => {
            setLocalSteram(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        });
    }, []);

    function sendLiveRequest(body: string) {
        if (stompClient.connected) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: '',
                type: 'LIVE',
                timestamp: new Date().getTime().toString(),
                body: body,
                seen: false,
                user: false,
            };
            stompClient.send('/app/live', JSON.stringify(chat));
        }
    }

    function sendPrivateMassage(body: string, friendID: string) {
        if (stompClient.connected) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendID,
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
        sendLiveRequest('off');
        window.close();
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('live-area')}>
                <div className={cx('video-area')}>
                    <video height={1280} width={720} ref={videoRef} muted autoPlay={true}></video>
                </div>
                <div className={cx('chat-area')}>CHAT AREA</div>
            </div>
            <div className={cx('action-area')}>
                <Button primary onClick={handleCloseCall}>
                    Thoat
                </Button>
            </div>
        </div>
    );
};

export default Live;
