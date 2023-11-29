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

// let peerConnection: RTCPeerConnection = new RTCPeerConnection(servers);
// let localStream: MediaStream = new MediaStream();
// let remoteStream: MediaStream = new MediaStream();

// peerConnection.onicecandidate = async (event) => {
//     if (event.candidate) {
//         console.log('candidate');
//         console.log(peerConnection.localDescription);
//     }
// };

const Call = () => {
    const [loading, setLoading] = useState(false);
    const { friendId, fullName, type, caller } = useParams();

    const [localStream, setLocalStream] = useState(new MediaStream());
    const [remoteStream, setRemoteStream] = useState(new MediaStream());
    const [peerConnection, setPeerConnection] = useState(new RTCPeerConnection(servers));

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

    const [message, setMessage] = useState<MessageChat | null>(null);

    useEffect(() => {
        const initCall = async () => {
            // peerConnection.onicecandidate = (event) => {
            //     if (event.candidate) {
            //         console.log('candidate');
            //         console.log(peerConnection.localDescription);
            //     }
            // };

            peerConnection.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    console.log('get track');
                    console.log(track);
                    setRemoteStream((prevStream) => {
                        const newStream = new MediaStream();
                        newStream.addTrack(track);
                        return newStream;
                    });
                });
            };

            localStream.getTracks().forEach((track) => {
                console.log('send track');
                console.log(track);
                peerConnection.addTrack(track, localStream);
            });
        };

        initCall();

        // return () => {
        //     peerConnection.close();
        // };
    }, [localStream, peerConnection]);

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
                            sendPrivateMassage('done[*]');
                        }
                    } else if (message.body === 'done[*]') {
                        if (!isDone) {
                            setIsDone(true);
                        }
                    } else {
                        const jsonData = JSON.parse(message.body);
                        switch (jsonData.type) {
                            case 'offer':
                                if (peerConnection) {
                                    let offer = JSON.parse(message.body);
                                    await peerConnection.setRemoteDescription(offer);
                                    const answer = await peerConnection.createAnswer();
                                    await peerConnection.setLocalDescription(answer);
                                    sendPrivateMassage(JSON.stringify(answer));
                                }
                                break;
                            case 'answer':
                                if (peerConnection) {
                                    let answer = JSON.parse(message.body);
                                    if (!peerConnection.currentRemoteDescription) {
                                        peerConnection.setRemoteDescription(answer);
                                    }
                                    sendPrivateMassage('done');
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
        if (stompClient.connected && isAccept) {
            sendPrivateMassage('accept');
        }
    }, [stompClient]);

    useEffect(() => {
        if (isAccept) {
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

    useEffect(() => {
        function openStream() {
            const config = { audio: false, video: true };
            return navigator.mediaDevices.getUserMedia(config);
        }
        function playVideo(stream: MediaStream) {
            // localStream = stream;
            setLocalStream(stream);
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        }
        setLoading(true);
        if (isVideo) {
            openStream().then((stream: MediaStream) => {
                playVideo(stream);
                setLoading(false);
            });
        } else {
            const tracks = localStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
            setLocalStream(new MediaStream());
            setLoading(false);
        }
    }, [isVideo]);

    useEffect(() => {
        if (isDone) {
            console.log(peerConnection);
        }
    }, [isDone]);

    useEffect(() => {
        if (friendVideo.current) {
            friendVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

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
            console.log('sent message done!');
            console.log(body);
        }
    }

    const handleCloseCall = () => {
        sendPrivateMassage('cancel');
        window.close();
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('friend-area')}>
                <div className={cx('name')}>{fullName}</div>
                {isConnected ? (
                    <div className={cx('video')}>
                        <video height={160} width={160} ref={friendVideo} autoPlay={true} />
                    </div>
                ) : (
                    <div>{!isAccept ? 'Kết nối...' : 'Khởi tạo đường truyền...'}</div>
                )}
            </div>
            <div className={cx('user-area')}>
                <div className={cx('name')}>{user?.fullName}</div>
                {isVideo ? (
                    <div className={cx('video')}>
                        <video height={160} width={160} ref={userVideo} autoPlay={true} />
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
