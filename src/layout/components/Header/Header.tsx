import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Tippy from '@tippyjs/react';
import HeadlessTippy from '@tippyjs/react/headless';

import images from '../../../assets/images';
import { CheckIcon, Close, UserGroupIcon } from '../../../components/Icons';
import CallCard from '../../../components/CallCard';
import Button from '../../../components/Button';
import config from '../../../config';
import { Wrapper as PopperWrapper } from '../../../components/Popper';
import { UserService, SocketService } from '../../../apiService';
import {
    updateUserInfoSuccess,
    updateUserInfoFail,
    connectSuccess,
    getListFriendRequestSuccess,
    getListFriendRequestFail,
    getListFriendSuccess,
    acceptFriendSuccess,
    logout,
    removeFriendRequest,
    recieveMessage,
    updateLastMessage,
} from '../../../reducers';
import { State, Response, AuthenticationReponse, RawChat, MessageChat, NotificationChat } from '../../../type';
import { Client } from 'webstomp-client';
import i18n from '../../../i18n/i18n';

const cx = classNames.bind(styles);

function Header() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user, notifications, listFriend } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;
    const [showNotification, setShowNotification] = useState(false);

    const [callGuy, setCallGuy] = useState<{
        friendID: string;
        fullName: string;
        urlAvatar: string;
        type: string;
    } | null>(null);

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
                                                const { friendRResponse, friendShipRespone, actionCode } =
                                                    notificationData;
                                                if (friendRResponse) {
                                                    switch (actionCode) {
                                                        case 101:
                                                            dispatch(getListFriendRequestSuccess([friendRResponse]));
                                                            break;
                                                        case 102:
                                                            dispatch(removeFriendRequest(friendRResponse.id));
                                                            break;
                                                        default:
                                                    }
                                                }
                                                if (friendShipRespone) {
                                                    switch (actionCode) {
                                                        case 101:
                                                            dispatch(getListFriendSuccess([friendShipRespone]));
                                                            break;
                                                        case 102:
                                                            break;
                                                        default:
                                                    }
                                                }
                                                break;
                                            case 'MESSAGE':
                                                console.log('[get private message]:');
                                                console.log(data);
                                                dispatch(recieveMessage(data as MessageChat));
                                                dispatch(updateLastMessage(data as MessageChat));
                                                break;
                                            case 'CALL':
                                                console.log('[get private call]:');
                                                const body = JSON.parse(data.body) as {
                                                    fullName: string;
                                                    urlAvatar: string;
                                                    type: string;
                                                };
                                                const friendID = (data as MessageChat).from;
                                                const fullName = body.fullName;
                                                const type = body.type;
                                                const urlAvatar = body.urlAvatar;
                                                setCallGuy({ friendID, fullName, urlAvatar, type });
                                                break;
                                            case 'RTC':
                                                if (data.body === 'cancel') {
                                                    setCallGuy(null);
                                                }
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
    }, [user]);

    useEffect(() => {
        if (isLoggedIn) {
            if (user) {
                const callApiGetFriendRequests = async () => {
                    try {
                        const response = await UserService.getFriendRequests();
                        if (response?.ok) {
                            response.json().then((data) => {
                                dispatch(getListFriendRequestSuccess(data));
                            });
                        } else {
                            if (response === null || response?.status == 403) {
                                dispatch(getListFriendRequestFail());
                                navigate('/login');
                            }
                        }
                    } catch (error) {
                        alert(error);
                        console.log(error);
                    }
                };
                if (listFriendRequest.length == 0) {
                    callApiGetFriendRequests();
                }
            }
        }
    }, []);

    const handleHideNotification = () => {
        setShowNotification(false);
    };

    const handleAcceptFriend = async (requestID: string) => {
        setLoading(true);
        const response = await UserService.acceptFriendRequest(requestID);
        if (response) {
            const data = response.data as Response;
            switch (data.code) {
                case 200:
                    dispatch(acceptFriendSuccess(requestID));
                    break;
                case 404:
                    alert('Tin này không có sẵn');
                    dispatch(acceptFriendSuccess(requestID));
                    break;
                case 409:
                    alert('Tin này không có sẵn');
                    dispatch(acceptFriendSuccess(requestID));
                    break;
                default:
                    alert(data.message);
            }
        } else {
            dispatch(logout());
        }
        setLoading(false);
    };

    const handleDenyFriend = async (requestID: string) => {
        setLoading(true);
        const response = await UserService.denyFriendRequest(requestID);
        if (response) {
            const data = response.data as Response;
            switch (data.code) {
                case 200:
                    dispatch(removeFriendRequest(requestID));
                    break;
                case 404:
                    alert('Tin này không có sẵn');
                    dispatch(removeFriendRequest(requestID));
                    break;
                case 409:
                    alert('Tin này không có sẵn');
                    dispatch(removeFriendRequest(requestID));
                    break;
                default:
                    alert(data.message);
            }
        } else {
            dispatch(logout());
        }
        setLoading(false);
    };

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link to={config.routes.home} className={cx('logo')}>
                    <img src={images.logo} alt="TipConnect" />
                </Link>
                <div className={cx('income-call')}>
                    {callGuy && (
                        <CallCard
                            userID={user?.userID || ''}
                            stompClient={stompClient}
                            friendID={callGuy.friendID}
                            fullName={callGuy.fullName}
                            urlAvatar={callGuy.urlAvatar}
                            type={callGuy.type}
                            setCallGuy={setCallGuy}
                        />
                    )}
                </div>
                <div className={cx('actions')}>
                    {isLoggedIn ? (
                        <>
                            <div>
                                <HeadlessTippy
                                    interactive
                                    visible={showNotification}
                                    render={(attrs) => (
                                        <div className={cx('notification-area')} tabIndex={-1} {...attrs}>
                                            <PopperWrapper>
                                                <h4 className={cx('notification-title')}>Yêu cầu kết bạn</h4>
                                                {listFriendRequest.map((friendRequest) => {
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
                                                                    disabled={loading}
                                                                >
                                                                    <CheckIcon />
                                                                </button>
                                                                <button
                                                                    className={cx('cancel_button')}
                                                                    onClick={() => handleDenyFriend(id)}
                                                                    disabled={loading}
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
                                        <UserGroupIcon />
                                        <span className={cx('badge')}>{listFriendRequest.length}</span>
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
