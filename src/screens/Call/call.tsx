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
import { Client } from 'webstomp-client';

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

class MyConnection {
    private peerConnection: RTCPeerConnection;
    private stompClient: Client;
    private friendID: string;
    private userID: string;
    private localStream: MediaStream;
    private remoteStream: MediaStream;

    constructor(
        localStream: MediaStream,
        remoteStream: MediaStream,
        stompClient: Client,
        userID: string,
        friendID: string,
    ) {
        this.peerConnection = new RTCPeerConnection(servers);
        this.localStream = localStream;
        this.remoteStream = remoteStream;
        this.stompClient = stompClient;
        this.userID = userID;
        this.friendID = friendID;

        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', this.peerConnection.iceConnectionState);
        };
        this.localStream.getTracks().forEach((track) => this.peerConnection.addTrack(track, this.localStream));

        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
        };
    }

    public createOffer = async () => {
        this.peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                //this.sendRTCMessage(JSON.stringify(this.peerConnection.localDescription));
                return offer;
            }
        };
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        console.log(offer);
    };

    public createAnswer = async (offerString: string) => {
        let offer = JSON.parse(offerString);
        this.peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                this.sendRTCMessage(JSON.stringify(this.peerConnection.localDescription));
            }
        };
        await this.peerConnection.setRemoteDescription(offer);
        let answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
    };

    public addAnswer = async (answerString: string) => {
        let answer = JSON.parse(answerString);
        if (!this.peerConnection.currentRemoteDescription) {
            this.peerConnection.setRemoteDescription(answer);
        }
    };

    public sendRTCMessage(body: string) {
        if (this.stompClient.connected) {
            const chat: MessageChat = {
                from: this.userID,
                to: this.friendID,
                type: 'RTC',
                body: body,
                seen: false,
                user: true,
            };
            this.stompClient.send('/app/tradeRTC', JSON.stringify(chat));
        }
    }
}

let localStream: MediaStream = new MediaStream();
let remoteStream: MediaStream = new MediaStream();

const Call = () => {
    let myConnection: MyConnection;

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
        if (userVideo.current) {
            userVideo.current.srcObject = localStream;
        }
        if (friendVideo.current) {
            friendVideo.current.srcObject = remoteStream;
        }
    }, [userVideo, friendVideo]);

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
                                    if (stompClient.connected) {
                                        console.log('vào được a');
                                        // const chat: MessageChat = {
                                        //     from: user?.userID || '',
                                        //     to: friendId || '',
                                        //     type: 'RTC',
                                        //     body: JSON.stringify(offer),
                                        //     seen: false,
                                        //     user: true,
                                        // };
                                        // stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                        if (myConnection) {
                                            console.log('vào được b');
                                            const offer = await myConnection.createOffer();
                                            console.log(offer);
                                            console.log('vào được c');
                                        }
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
                                            // peerConnection.setRemoteDescription(new RTCSessionDescription(jsonData));
                                            // const answer = await peerConnection.createAnswer();
                                            // await peerConnection.setLocalDescription(answer);
                                            // if (stompClient.connected && answer) {
                                            //     const chat: MessageChat = {
                                            //         from: user?.userID || '',
                                            //         to: friendId || '',
                                            //         type: 'RTC',
                                            //         body: JSON.stringify(answer),
                                            //         seen: false,
                                            //         user: true,
                                            //     };
                                            //     stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                            // }
                                            if (myConnection) {
                                                myConnection.createAnswer(data.body);
                                            }
                                            break;
                                        case 'answer':
                                            // peerConnection.setRemoteDescription(new RTCSessionDescription(jsonData));
                                            // if (stompClient.connected) {
                                            //     const chat: MessageChat = {
                                            //         from: user?.userID || '',
                                            //         to: friendId || '',
                                            //         type: 'RTC',
                                            //         body: 'done',
                                            //         seen: false,
                                            //         user: true,
                                            //     };
                                            //     stompClient.send('/app/tradeRTC', JSON.stringify(chat));
                                            // }
                                            if (myConnection) {
                                                myConnection.addAnswer(data.body);
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
            myConnection = new MyConnection(localStream, remoteStream, stompClient, user?.userID || '', friendId || '');
        }
    }, [stompClient]);

    useEffect(() => {
        if (isAccept) {
            myConnection = new MyConnection(localStream, remoteStream, stompClient, user?.userID || '', friendId || '');
            sendPrivateMassage('connect');
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
            }
        }
        setLoading(true);
        if (isVideo) {
            openStream().then((stream: MediaStream) => {
                playVideo(stream);
                setLoading(false);
            });
        } else {
            if (localStream) {
                const tracks = localStream.getTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
                if (userVideo.current) {
                    localStream = new MediaStream();
                }
            }
            setLoading(false);
        }
    }, [isVideo]);

    useEffect(() => {
        if (isDone) {
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

    // const createOffer = async () => {
    //     offer = await peerConnection.createOffer();
    //     await peerConnection.setLocalDescription(offer);
    //     peerConnection.oniceconnectionstatechange = () => {
    //         console.log('ICE connection state:', peerConnection.iceConnectionState);
    //     };
    //     peerConnection.ontrack = (event) => {
    //         remoteStream = event.streams[0];
    //         console.log('tùm lum');
    //         console.log(remoteStream);
    //         if (friendVideo.current) {
    //             friendVideo.current.srcObject = remoteStream;
    //             friendVideo.current.play();
    //         }
    //     };

    //     sendPrivateMassage('connect');
    //     setIsConnected(true);
    // };

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
