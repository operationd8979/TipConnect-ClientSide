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

const Call = () => {
    const [loading, setLoading] = useState(false);
    const { friendId, fullName, type, caller } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userVideo = useRef<HTMLVideoElement>(null);
    const friendVideo = useRef<HTMLVideoElement>(null);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { isLoggedIn, user, notifications, listFriend } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;

    const [isVideo, setIsVideo] = useState<boolean>(type === 'video' ? true : false);
    const [isAccept, setIsAccept] = useState(!(caller === 'caller'));
    const [isConnected, setIsConnected] = useState(false);

    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            if (stompClient.connected) {
                SocketService.disconnectStomp(stompClient);
            }
        };
    }, []);

    useEffect(() => {
        window.addEventListener('beforeunload', () => sendPrivateMassage('cancel'));
        if (user) {
            if (!stompClient.connected) {
                console.log('<<<<<<<<<<<<<<<<CONNECT WS>>>>>>>>>>>>>>>>');
                SocketService.connectStomp(socket, stompClient, user.userID).then((response) => {
                    const { socket, stompClient } = response;
                    stompClient.subscribe('/users/private', function (message) {
                        try {
                            const data: MessageChat = JSON.parse(message.body);
                            if (data.type === 'RTC') {
                                if (data.body === 'cancel') {
                                    handleCloseCall();
                                } else if (data.body === 'connect') {
                                    setIsAccept(true);
                                }
                            }
                        } catch (error) {
                            alert('Some message lost!');
                        }
                    });
                    dispatch(connectSuccess({ socket, stompClient }));
                });
            }
        }
    }, []);

    useEffect(() => {
        if (isAccept) {
            // Code to handle the connected state, if needed
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
                userVideo.current.srcObject = stream;
                userVideo.current.play();
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
            console.log(mediaStream);
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

    function sendPrivateMassage(body: string) {
        if (stompClient) {
            const chat: MessageChat = {
                from: user?.userID || '',
                to: friendId || '',
                type: 'RTC',
                body: body,
                seen: false,
                user: true,
            };
            stompClient.send('/app/private', JSON.stringify(chat));
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
                        <video height={160} width={160} ref={friendVideo} />
                    </div>
                ) : (
                    <div>{!isAccept ? 'Kết nối...' : 'Khởi tạo đường truyền...'}</div>
                )}
            </div>
            <div className={cx('user-area')}>
                <div className={cx('name')}>{user?.fullName}</div>
                <div className={cx('video')}>
                    <video height={160} width={160} ref={userVideo} />
                </div>
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
