import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import Styles from './Call.module.scss';

import { VideoCall, Close } from '../../components/Icons';
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

var peerConnection = new RTCPeerConnection(servers);
let offer: any = null;

let localStream: MediaStream;
let remoteStream: MediaStream;

let dataChannel: RTCDataChannel | null = null;

const Call = () => {
    const [loading, setLoading] = useState(false);
    const { friendId, fullName, type, caller } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userVideo = useRef<HTMLVideoElement>(null);
    const friendVideo = useRef<HTMLVideoElement>(null);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { user } = currentUser;
    const { socket, stompClient } = currentStomp;

    const [isVideo, setIsVideo] = useState<boolean>(type === 'video' ? true : false);
    const [isAccept, setIsAccept] = useState(!(caller === 'caller'));
    const [isConnected, setIsConnected] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (user) {
            if (!stompClient.connected) {
                console.log('<<<<<<<<<<<<<<<<CONNECT WS>>>>>>>>>>>>>>>>');
                SocketService.connectStomp(socket, stompClient, user.userID).then((response) => {
                    const { socket, stompClient } = response;
                    stompClient.subscribe('/users/private', async function (message) {
                        try {
                            const data: MessageChat = JSON.parse(message.body);
                            if (data.type === 'RTC') {
                                if (data.body === 'cancel') {
                                    handleCloseCall();
                                } else if (data.body === 'accept') {
                                    if (!isAccept) setIsAccept(true);
                                } else if (data.body === 'connect') {
                                    if (stompClient.connected && offer) {
                                        const chat: MessageChat = {
                                            from: user?.userID || '',
                                            to: friendId || '',
                                            type: 'RTC',
                                            body: JSON.stringify(offer),
                                            seen: false,
                                            user: true,
                                        };
                                        stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                    }
                                } else if (data.body === 'done') {
                                    if (!isDone) {
                                        setIsDone(true);
                                        if (stompClient.connected) {
                                            const chat: MessageChat = {
                                                from: user?.userID || '',
                                                to: friendId || '',
                                                type: 'RTC',
                                                body: 'done[*]',
                                                seen: false,
                                                user: true,
                                            };
                                            stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                        }
                                    }
                                } else if (data.body === 'done[*]') {
                                    if (!isDone) {
                                        setIsDone(true);
                                    }
                                } else {
                                    const jsonData = JSON.parse(data.body);
                                    switch (jsonData.type) {
                                        case 'offer':
                                            peerConnection.setRemoteDescription(new RTCSessionDescription(jsonData));
                                            const answer = await peerConnection.createAnswer();
                                            await peerConnection.setLocalDescription(answer);
                                            if (stompClient.connected && answer) {
                                                const chat: MessageChat = {
                                                    from: user?.userID || '',
                                                    to: friendId || '',
                                                    type: 'RTC',
                                                    body: JSON.stringify(answer),
                                                    seen: false,
                                                    user: true,
                                                };
                                                stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                            }
                                            break;
                                        case 'answer':
                                            peerConnection.setRemoteDescription(new RTCSessionDescription(jsonData));
                                            if (stompClient.connected) {
                                                const chat: MessageChat = {
                                                    from: user?.userID || '',
                                                    to: friendId || '',
                                                    type: 'RTC',
                                                    body: 'done',
                                                    seen: false,
                                                    user: true,
                                                };
                                                stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                            }
                                            break;
                                        default:
                                            console.log(jsonData);
                                    }
                                }
                            }
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
        if (stompClient.connected && isAccept) {
            sendPrivateMassage('accept');
        }
    }, [stompClient]);

    useEffect(() => {
        if (isAccept) {
            createOffer();
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

    useEffect(() => {
        function openStream() {
            const config = { audio: false, video: true };
            return navigator.mediaDevices.getUserMedia(config);
        }
        function playVideo(stream: MediaStream) {
            if (userVideo.current) {
                localStream = stream;
                userVideo.current.srcObject = stream;
                userVideo.current.play();
                if (peerConnection) {
                    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
                }
            }
        }
        setLoading(true);
        if (isVideo) {
            openStream().then((stream: MediaStream) => {
                playVideo(stream);
                setMediaStream(stream);
                setLoading(false);
            });
        } else {
            if (mediaStream) {
                const tracks = mediaStream.getTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
                if (userVideo.current) {
                    userVideo.current.srcObject = null;
                    setMediaStream(null);
                }
            }
            setLoading(false);
        }
    }, [isVideo]);

    useEffect(() => {
        if (isDone) {
            console.log(peerConnection);
            console.log(dataChannel);
        }
    }, [isDone]);

    function sendPrivateMassage(body: string) {
        if (stompClient.connected) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                type: 'RTC',
                body: body,
                seen: false,
                user: true,
            };
            stompClient.send('/app/tradeRTC', JSON.stringify(chat));
        }
    }

    const handleCloseCall = () => {
        sendPrivateMassage('cancel');
        window.close();
    };

    const createOffer = async () => {
        offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnection.iceConnectionState);
        };
        peerConnection.ontrack = (event) => {
            remoteStream = event.streams[0];
            console.log('tùm lum');
            console.log(remoteStream);
            if (friendVideo.current) {
                friendVideo.current.srcObject = remoteStream;
                friendVideo.current.play();
            }
        };
        peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;

            dataChannel.onmessage = (event) => {
                const receivedData = event.data;
                console.log('Received data:', receivedData);
            };

            dataChannel.onopen = () => {
                console.log('Data Channel is open');
            };

            dataChannel.onclose = () => {
                console.log('Data Channel is closed');
            };
        };

        dataChannel = peerConnection.createDataChannel('dataChannel');
        dataChannel.onmessage = (event) => {
            const receivedData = event.data;
            console.log('Received data:', receivedData);
        };
        dataChannel.onopen = () => {
            console.log('Data Channel is open');
        };
        dataChannel.onclose = () => {
            console.log('Data Channel is closed');
        };
        sendPrivateMassage('connect');
        setIsConnected(true);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('friend-area')}>
                <div className={cx('name')}>{fullName}</div>
                {isConnected ? (
                    <div className={cx('video')}>
                        <video height={160} width={160} ref={friendVideo} />
                    </div>
                ) : (
                    <div>{!isAccept ? 'Kết nối...' : 'Khởi tạo đường truyền...'}</div>
                )}
            </div>
            <div className={cx('user-area')}>
                <div className={cx('name')}>{user?.fullName}</div>
                {isVideo ? (
                    <div className={cx('video')}>
                        <video height={160} width={160} ref={userVideo} />
                    </div>
                ) : (
                    <div className={cx('image')}>
                        <img src={user?.urlAvatar} />
                    </div>
                )}
            </div>
            <div className={cx('action-area')}>
                <div>
                    <button onClick={() => setIsVideo(!isVideo)} disabled={loading}>
                        <VideoCall />
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
