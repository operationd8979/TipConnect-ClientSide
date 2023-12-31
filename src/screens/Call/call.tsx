import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import Styles from './Call.module.scss';

import { VideoCall, Call as CallIcon, Close } from '../../components/Icons';
import { SocketService } from '../../apiService';
import { connectSuccess } from '../../reducers';
import { MessageChat, State, StateWS } from '../../type';
import pathAudio from '../../contants/pathAudio';

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

let peerConnection = new RTCPeerConnection(servers);

const defaultURL =
    'https://firebasestorage.googleapis.com/v0/b/tipconnect-14d4b.appspot.com/o/Default%2FdefaultAvatar.jpg?alt=media&token=a0a33d34-e4c4-4ed0-8b52-6da79b7b048a';

const Call = () => {
    const [loading, setLoading] = useState(false);
    const { relationShipID, fullName, type, caller } = useParams();

    const [beginTime, setBeginTime] = useState<Date | null>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userVideo = useRef<HTMLVideoElement>(null);
    const friendVideo = useRef<HTMLVideoElement>(null);

    const [localStream, setLocalStream] = useState<MediaStream>(new MediaStream());
    const [remoteStream, setRemoteStream] = useState<MediaStream>(new MediaStream());

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { user } = currentUser;
    const { socket, stompClient } = currentStomp;

    const [isVideo, setIsVideo] = useState<boolean>(type === 'video' ? true : false);
    const [isFriendVideo, setIsFriendVideo] = useState<boolean>(type === 'video' ? true : false);

    const [isAudio, setIsAudio] = useState<boolean>(true);
    const [isAccept, setIsAccept] = useState(!(caller === 'caller'));
    const [isConnected, setIsConnected] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const [message, setMessage] = useState<MessageChat | null>(null);
    const [candidate, setCandidate] = useState<RTCSessionDescription | null>(null);

    useEffect(() => {
        if (candidate) {
            console.log('candidate');
            console.log(candidate);
            sendPrivateMassage(JSON.stringify(candidate));
        }
    }, [candidate]);

    useEffect(() => {
        if (message != null) {
            const handleRTCTrade = async () => {
                if (message.type === 'RTC') {
                    if (message.body === 'cancel') {
                        handleCloseCall();
                    } else if (message.body === 'accept') {
                        if (!isAccept) setIsAccept(true);
                    } else if (message.body === 'connect') {
                        if (!isConnected) setIsConnected(true);
                        if (peerConnection) {
                            const offer = await peerConnection.createOffer();
                            await peerConnection.setLocalDescription(offer);
                            sendPrivateMassage(JSON.stringify(offer));
                        }
                    } else if (message.body === 'done') {
                        if (!isDone) {
                            setIsDone(true);
                        }
                    } else if (message.body === 'video') {
                        setIsFriendVideo(true);
                    } else if (message.body === 'audio') {
                        setIsFriendVideo(false);
                    } else {
                        const jsonData = JSON.parse(message.body);
                        switch (jsonData.type) {
                            case 'offer':
                                if (peerConnection) {
                                    const offer = JSON.parse(message.body);
                                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                                    const answer = await peerConnection.createAnswer();
                                    await peerConnection.setLocalDescription(answer);
                                }
                                break;
                            case 'answer':
                                if (peerConnection) {
                                    const answer = JSON.parse(message.body);
                                    if (
                                        peerConnection.remoteDescription === null &&
                                        peerConnection.currentRemoteDescription === null
                                    ) {
                                        try {
                                            await peerConnection.setRemoteDescription(answer);
                                        } catch (error) {
                                            console.log('Error setRemoteDescription from answer: ' + error);
                                        }
                                    }
                                    sendPrivateMassage('done');
                                    setIsDone(true);
                                }
                                break;
                            default:
                                console.log(jsonData);
                        }
                    }
                }
            };
            handleRTCTrade();
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
                            alert(error);
                        }
                    });
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
        if (friendVideo.current) {
            friendVideo.current.srcObject = remoteStream;
        }
    }, [isFriendVideo]);

    useEffect(() => {
        if (userVideo.current) {
            userVideo.current.srcObject = localStream;
        }
        localStream.getTracks().forEach((track) => {
            const sender = peerConnection.getSenders().find((s) => s.track?.kind === track.kind);
            if (sender) {
                sender.replaceTrack(track);
            } else {
                peerConnection.addTrack(track, localStream);
            }
        });
    }, [localStream]);

    useEffect(() => {
        if (friendVideo.current) {
            friendVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        //OPEN MEDIA STREAM
        if (stompClient.connected) {
            function openStream() {
                const config = { audio: true, video: true };
                console.log('open camera');
                return navigator.mediaDevices.getUserMedia(config);
            }
            function playVideo(stream: MediaStream) {
                console.log('done open camera');
                setLocalStream(stream);
                peerConnection.onicecandidate = async (event) => {
                    if (event.candidate) {
                        const sdp = peerConnection.localDescription;
                        if (sdp?.type === 'answer') setCandidate(peerConnection.localDescription);
                    }
                };
                peerConnection.ontrack = (event) => {
                    console.log('get track');
                    setRemoteStream(event.streams[0]);
                };
            }
            setLoading(true);
            openStream().then((stream: MediaStream) => {
                playVideo(stream);
                setLoading(false);
                if (caller === 'caller') {
                    callPrivate();
                }
                if (isAccept) {
                    sendPrivateMassage('accept');
                }
            });
        }
    }, [stompClient]);

    useEffect(() => {
        //audio wait accept
        if (isAccept) {
            if (caller === 'caller') setBeginTime(new Date());
            sendPrivateMassage('connect');
            setIsConnected(true);
        } else {
            const audioElement = new Audio(pathAudio.waitConnect);
            audioElement.loop = true;
            audioElement.play();
            return () => {
                audioElement.pause();
                audioElement.currentTime = 0;
            };
        }
    }, [isAccept]);

    const handleChangeType = (isAudio: boolean, isVideo: boolean) => {
        console.log('[audio]:' + isAudio);
        console.log('[video]:' + isVideo);
        if (isVideo) {
            sendPrivateMassage('video');
        } else {
            sendPrivateMassage('audio');
        }
        function openStream() {
            const config = { audio: isAudio, video: isVideo };
            return navigator.mediaDevices.getUserMedia(config);
        }
        function playVideo(stream: MediaStream) {
            if (localStream) {
                const tracks = localStream.getTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
            }
            setLocalStream(stream);
        }
        setLoading(true);
        if (!isAudio && !isVideo) {
            if (localStream) {
                const tracks = localStream.getTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
            }
            setLoading(false);
            return;
        }
        openStream().then((stream: MediaStream) => {
            playVideo(stream);
            setLoading(false);
        });
    };

    useEffect(() => {
        if (isDone) {
            if (isVideo) {
                sendPrivateMassage('video');
            } else {
                sendPrivateMassage('audio');
            }
        }
    }, [isDone]);

    function sendPrivateMassage(body: string) {
        if (stompClient.connected) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: relationShipID || '',
                type: 'RTC',
                timestamp: new Date().getTime().toString(),
                body: body,
                seen: false,
                user: true,
            };
            stompClient.send('/app/trade', JSON.stringify(chat));
        }
    }

    function callPrivate() {
        if (stompClient.connected && user) {
            const tinyUser = {
                fullName: user.fullName,
                urlAvatar: user.urlAvatar,
                type: type,
            };
            const chat: MessageChat = {
                from: user?.userID || '',
                to: relationShipID || '',
                type: 'CALL',
                timestamp: new Date().getTime().toString(),
                body: JSON.stringify(tinyUser),
                seen: false,
                user: true,
            };
            stompClient.send('/app/trade', JSON.stringify(chat));
        }
    }

    const handleCloseCall = () => {
        sendPrivateMassage('cancel');
        if (beginTime) {
            const duration = new Date().getTime() - beginTime.getTime();
            if (stompClient.connected && user) {
                const chat: MessageChat = {
                    from: user.userID || '',
                    to: relationShipID || '',
                    timestamp: new Date().getTime().toString(),
                    type: 'ENDCALL',
                    body: duration.toString(),
                    seen: false,
                    user: true,
                };
                stompClient.send('/app/private', JSON.stringify(chat));
            }
        }
        window.close();
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('friend-area')}>
                <div className={cx('name')}>{fullName}</div>
                <div className={cx('video')} style={{ backgroundColor: 'black' }}>
                    <video ref={friendVideo} hidden={!isFriendVideo} autoPlay={true} />
                </div>
                {!isFriendVideo && (
                    <div className={cx('image')}>
                        <img src={defaultURL} />
                    </div>
                )}
                {isConnected ? <div></div> : <div>{!isAccept ? 'Kết nối...' : 'Khởi tạo đường truyền...'}</div>}
            </div>
            <div className={cx('user-area')}>
                <div className={cx('name')}>{user?.fullName}</div>
                <div className={cx('video')} style={{ backgroundColor: 'black' }}>
                    <video ref={userVideo} hidden={!isVideo} autoPlay={true} muted />
                </div>
                {!isVideo && (
                    <div className={cx('image')}>
                        <img src={user?.urlAvatar} />
                    </div>
                )}
            </div>
            <div className={cx('action-area')}>
                <div>
                    <button
                        style={!isVideo ? { color: 'red' } : {}}
                        onClick={() => {
                            setIsVideo(!isVideo);
                            handleChangeType(isAudio, !isVideo);
                        }}
                        disabled={loading}
                    >
                        <VideoCall />
                    </button>
                    <button
                        style={!isAudio ? { color: 'red' } : {}}
                        onClick={() => {
                            setIsAudio(!isAudio);
                            handleChangeType(!isAudio, isVideo);
                        }}
                        disabled={loading}
                    >
                        <CallIcon />
                    </button>
                    <button onClick={handleCloseCall}>
                        <Close />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Call;
