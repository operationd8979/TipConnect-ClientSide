import classNames from 'classnames/bind';
import { Link, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import HeadlessTippy from '@tippyjs/react/headless';
import styles from './Header.module.scss';
import config from '../../../config';
import images from '../../../assets/images';
import { InboxIcon, MessageIcon, UploadIcon, CheckIcon, UncheckIcon, Close } from '../../../components/Icons';
import Button from '../../../components/Button';
import i18n from '../../../i18n/i18n';
import { useSelector, useDispatch } from 'react-redux';
import {
    State,
    FriendRequestResponse,
    Response,
    AuthenticationReponse,
    RawChat,
    MessageChat,
    NotificationChat,
} from '../../../type';
import { useEffect, useState } from 'react';
import { Wrapper as PopperWrapper } from '../../../components/Popper';
import { UserService, SocketService } from '../../../apiService';
import { getListFriendFail, updateUserInfoSuccess, updateUserInfoFail, connectSuccess } from '../../../reducers';
import { Client } from 'webstomp-client';

const cx = classNames.bind(styles);

function Header() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user } = currentUser;
    const { socket, stompClient } = currentStomp;
    const [showNotification, setShowNotification] = useState(false);

    const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (stompClient.connected) {
                SocketService.disconnectStomp(stompClient);
            }
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            if (!stompClient.connected) {
                console.log('<<<<<<<<<<<<<<<<CONNECT WS>>>>>>>>>>>>>>>>');
                const getUserData = async () => {
                    const response = await UserService.getUserInfo();
                    if (response) {
                        const data = response.data as AuthenticationReponse;
                        if (data.code === 200) {
                            const newUser = data.user;
                            if (JSON.stringify(user) !== JSON.stringify(newUser)) {
                                localStorage.setItem('currentUser', JSON.stringify(newUser));
                                dispatch(updateUserInfoSuccess(newUser));
                            }
                            SocketService.connectStomp(socket, stompClient, newUser.userID).then((response) => {
                                const { socket, stompClient } = response;
                                stompClient.subscribe('/users/private', function (message) {
                                    try {
                                        const data = JSON.parse(message.body) as RawChat;
                                        switch (data.type) {
                                            case 'SYSTEM':
                                                const notificationData = data as NotificationChat;
                                                const { friendRResponse, friendShipRespone } = notificationData;
                                                if (friendRResponse) {
                                                    setFriendRequests((prevData) => [...prevData, friendRResponse]);
                                                    console.log(friendRResponse);
                                                }
                                                // if(friendShipRespone){
                                                //     set(prevData=>[...prevData,friendRResponse]);
                                                // }
                                                break;
                                            case 'MESSAGE':
                                                console.log(data as MessageChat);
                                                break;
                                            default:
                                                console.log(data);
                                        }
                                    } catch (error) {
                                        alert('Some message lost!');
                                    }
                                });
                                stompClient.subscribe('/all/messages', function (message) {
                                    console.log('nhận tin nhắn all:' + message.body);
                                    console.log(message);
                                });
                                dispatch(connectSuccess({ socket, stompClient }));
                            });
                        }
                    } else {
                        dispatch(updateUserInfoFail());
                        navigate('/login');
                    }
                };
                getUserData();
            }
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            if (user) {
                const callApiGetFriendRequests = async () => {
                    try {
                        const response = await UserService.getFriendRequests();
                        if (response?.ok) {
                            response.json().then((data) => {
                                setFriendRequests(data);
                            });
                        } else {
                            if (response === null || response?.status == 403) {
                                //dispatch(getListFriendFail());
                                navigate('/login');
                            }
                        }
                    } catch (error) {
                        alert(error);
                        console.log(error);
                        //dispatch(getListFriendFail());
                        navigate('/login');
                    }
                };
                if (friendRequests.length == 0) {
                    callApiGetFriendRequests();
                }
            }
        }
    }, []);

    useEffect(() => {}, []);

    const handleHideNotification = () => {
        setShowNotification(false);
    };

    const handleAcceptFriend = async (requestID: string) => {
        const response = await UserService.acceptFriendRequest(requestID);
        if (response) {
            const data = response.data as Response;
            if (data.code === 200) {
                const newFriendRequests = friendRequests.filter((friendRequest) => friendRequest.id !== requestID);
                setFriendRequests(newFriendRequests);
                //dispatch
            } else {
                alert(data.message);
            }
        }
    };

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link to={config.routes.home} className={cx('logo')}>
                    <img src={images.logo} alt="TipConnect" />
                </Link>
                <div className={cx('actions')}>
                    {isLoggedIn ? (
                        <>
                            {/* <Tippy delay={[0, 50]} content="Upload video" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <UploadIcon />
                                </button>
                            </Tippy>
                            <Tippy delay={[0, 50]} content="Message" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <MessageIcon />
                                </button>
                            </Tippy> */}
                            <div>
                                <HeadlessTippy
                                    interactive
                                    visible={showNotification}
                                    render={(attrs) => (
                                        <div className={cx('notification-area')} tabIndex={-1} {...attrs}>
                                            <PopperWrapper>
                                                <h4 className={cx('notification-title')}>Yêu cầu kết bạn</h4>
                                                {friendRequests.map((friendRequest) => {
                                                    const { id, sender, time_stamp } = friendRequest;
                                                    return (
                                                        <div className={cx('notification-item')} key={id}>
                                                            <div className={cx('notification-image')}>
                                                                <img src={sender.urlAvatar} alt={sender.fullName} />
                                                            </div>
                                                            <div className={cx('notification-info')}>
                                                                <div className={cx('notification-name')}>
                                                                    {sender.fullName}
                                                                </div>
                                                                <div className={cx('notification-content')}>
                                                                    Email:{sender.email}
                                                                </div>
                                                            </div>
                                                            <div className={cx('notification-action-area')}>
                                                                <button
                                                                    className={cx('plus_button')}
                                                                    onClick={() => handleAcceptFriend(id)}
                                                                >
                                                                    <CheckIcon />
                                                                </button>
                                                                <button
                                                                    className={cx('cancel_button')}
                                                                    onClick={() => {
                                                                        alert('press');
                                                                    }}
                                                                >
                                                                    <Close />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </PopperWrapper>
                                        </div>
                                    )}
                                    onClickOutside={handleHideNotification}
                                >
                                    <button
                                        className={cx('action-btn')}
                                        onClick={() => {
                                            setShowNotification(true);
                                        }}
                                    >
                                        <InboxIcon />
                                        <span className={cx('badge')}>{friendRequests.length}</span>
                                    </button>
                                </HeadlessTippy>
                            </div>
                            <Tippy delay={[0, 50]} content="User profile" placement="bottom">
                                <Link to="/profile" className={cx('avatar_user')}>
                                    <button className={cx('action-btn')}>
                                        <img src={user?.urlAvatar} alt="user" />
                                    </button>
                                </Link>
                            </Tippy>
                        </>
                    ) : (
                        <>
                            <Button primary to={config.routes.login}>
                                {i18n.t('HEADER_login')}
                            </Button>
                            <Button outline to={config.routes.register}>
                                {i18n.t('HEADER_register')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
