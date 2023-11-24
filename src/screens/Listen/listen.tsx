import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageChat, NotificationChat, RawChat, State, StateWS } from '../../type';
import classNames from 'classnames/bind';
import Styles from './Listen.module.scss';
import { SocketService } from '../../apiService';
import {
    updateUserInfoSuccess,
    updateUserInfoFail,
    connectSuccess,
    getListFriendRequestSuccess,
    getListFriendFail,
    getListFriendRequestFail,
    getListFriendSuccess,
    acceptFriendSuccess,
    acceptFriendFail,
    logout,
    removeFriendRequest,
    recieveMessage,
    updateLastMessage,
} from '../../reducers';
import { VideoCall, Close } from '../../components/Icons';

const cx = classNames.bind(Styles);

const Listen = () => {
    const { friendId, fullName, type } = useParams();

    const [loading, setLoading] = useState(false);
    const [isVideo, setIsVideo] = useState<boolean>(type === 'video' ? true : false);
    const [isConnected, setIsConnected] = useState(false);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as StateWS;
    const { isLoggedIn, user, notifications, listFriend } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userVideo = useRef<HTMLVideoElement>(null);
    const friendVideo = useRef<HTMLVideoElement>(null);

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
                SocketService.connectStomp(socket, stompClient, user?.userID).then((response) => {
                    const { socket, stompClient } = response;
                    stompClient.subscribe('/users/private', function (message) {
                        try {
                            const data = JSON.parse(message.body);
                            console.log(data);
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
        if (isConnected) {
            // Code to handle the connected state, if needed
        } else {
            const audioElement = new Audio('/assets/audios/nokiaSound.mp3');
            audioElement.loop = true;
            audioElement.play();
            return () => {
                audioElement.pause();
                audioElement.currentTime = 0;
            };
        }
    }, [isConnected]);

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
            //setListMessage((preList) => [...preList, chat]);
            //dispatch(updateLastMessage(chat));
            //setBodyChat('');
        }
    }

    const handleCloseCall = () => {
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
                    <div>Kết nối...</div>
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
                    <button onClick={handleCloseCall} disabled={loading}>
                        <Close />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Listen;
