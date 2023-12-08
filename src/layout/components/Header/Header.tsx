import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Tippy from '@tippyjs/react';
import HeadlessTippy from '@tippyjs/react/headless';

import images from '../../../assets/images';
import {
    CheckIcon,
    Close,
    EnglishItem,
    LanguegeItem,
    LogoutItem,
    ProfileItem,
    TripleDot,
    UserGroupIcon,
    VietNameItem,
} from '../../../components/Icons';
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
    updateLastMessage,
    changeLanguage,
} from '../../../reducers';
import {
    State,
    Response,
    AuthenticationReponse,
    RawChat,
    MessageChat,
    NotificationChat,
    SettingItem,
} from '../../../type';
import { Client } from 'webstomp-client';
import Menu from '../../../components/Menu';

const cx = classNames.bind(styles);

function Header() {
    const [loading, setLoading] = useState(false);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user, notifications, listFriend, i18n } = currentUser;
    const { listFriendRequest, listNotification } = notifications;
    const { socket, stompClient } = currentStomp;
    const [showNotification, setShowNotification] = useState(false);
    const [showSetting, setShowSetting] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [callGuy, setCallGuy] = useState<{
        friendID: string;
        fullName: string;
        urlAvatar: string;
        type: string;
    } | null>(null);

    useEffect(() => {
        //get list friend
        if (isLoggedIn && user) {
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
                            navigate(config.routes.login);
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
        return () => {
            //clean up websocket connect
            if (stompClient.connected) {
                SocketService.disconnectStomp(stompClient);
            }
        };
    }, []);

    useEffect(() => {
        //connect websocket
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
                                            case 'PHOTO':
                                            case 'GIF':
                                            case 'PDF':
                                            case 'WORD':
                                            case 'EXCEL':
                                            case 'ENDCALL':
                                                dispatch(updateLastMessage(data as MessageChat));
                                                break;
                                            case 'CALL':
                                                console.log('[get private call]:');
                                                if (!callGuy) {
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
                                                }
                                                break;
                                            case 'RTC':
                                                if (data.body === 'cancel') {
                                                    setCallGuy(null);
                                                }
                                                break;
                                            default:
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
                        navigate(config.routes.login);
                    }
                };
                getUserData();
            }
        }
    }, [user]);

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

    const MENU_ITEMS: SettingItem[] = [
        {
            icon: <LanguegeItem />,
            title: i18n.t('FINAL_language'),
            children: [
                {
                    icon: <VietNameItem />,
                    title: i18n.t('FINAL_vietnamese'),
                    onClick: () => {
                        i18n.locale = 'vi';
                        dispatch(changeLanguage(i18n));
                    },
                },
                {
                    icon: <EnglishItem />,
                    title: i18n.t('FINAL_english'),
                    onClick: () => {
                        i18n.locale = 'en';
                        dispatch(changeLanguage(i18n));
                    },
                },
            ],
            onClick: () => {
                alert('ua3');
            },
        },
    ];

    const MENU_USER: SettingItem[] = [
        {
            icon: <ProfileItem />,
            title: i18n.t('HEADER_MENU_PROFILE'),
            to: config.routes.profile,
        },
        {
            icon: <LogoutItem />,
            title: i18n.t('FINAL_logout'),
            onClick: () => {
                dispatch(logout());
                navigate(config.routes.login);
            },
        },
    ];

    const [finalMenu, setFinalMenu] = useState<SettingItem[][]>([MENU_ITEMS]);
    const [finalMenuUser, setFinalMenuUser] = useState<SettingItem[][]>([[...MENU_ITEMS, ...MENU_USER]]);

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link to={config.routes.home} className={cx('logo-area')}>
                    <img src={images.logo} alt={i18n.t('FINAL_NAME_APP')} />
                </Link>
                <div className={cx('income-call')}>
                    {user && callGuy && (
                        <CallCard
                            stompClient={stompClient}
                            userID={user.userID}
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
                            <HeadlessTippy
                                interactive
                                visible={showNotification}
                                render={(attrs) => (
                                    <div className={cx('notification-area')} tabIndex={-1} {...attrs}>
                                        <PopperWrapper>
                                            <h4 className={cx('notification-title')}>
                                                {i18n.t('HEADER_friend_request')}
                                            </h4>
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
                                                                {i18n.t('FINAL_email')}:{sender.email}
                                                            </div>
                                                        </div>
                                                        <div className={cx('notification-action-area')}>
                                                            <button
                                                                className={cx('button-accept')}
                                                                onClick={() => handleAcceptFriend(id)}
                                                                disabled={loading}
                                                            >
                                                                <CheckIcon />
                                                            </button>
                                                            <button
                                                                className={cx('button-cancel')}
                                                                onClick={() => handleDenyFriend(id)}
                                                                disabled={loading}
                                                            >
                                                                <Close />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {listFriendRequest.length === 0 && (
                                                <div className={cx('notification-notice')}>
                                                    {i18n.t('HEADER_no_notification')}
                                                </div>
                                            )}
                                        </PopperWrapper>
                                    </div>
                                )}
                                onClickOutside={() => setShowNotification(false)}
                            >
                                <div className={cx('action-btn')}>
                                    <button
                                        onClick={() => {
                                            setShowNotification(true);
                                        }}
                                    >
                                        <UserGroupIcon />
                                        <span className={cx('badge')}>{listFriendRequest.length}</span>
                                    </button>
                                </div>
                            </HeadlessTippy>
                            <HeadlessTippy
                                interactive
                                placement="bottom-end"
                                visible={showSetting}
                                render={(attrs) => (
                                    <div className={cx('setting-area')} tabIndex={-1} {...attrs}>
                                        <PopperWrapper>
                                            <Menu
                                                menuItem={finalMenuUser}
                                                setMenuItem={setFinalMenuUser}
                                                header={i18n.t('FINAL_setting')}
                                                setShowTab={setShowSetting}
                                            />
                                        </PopperWrapper>
                                    </div>
                                )}
                                onClickOutside={() => {
                                    setShowSetting(false);
                                }}
                            >
                                <button
                                    style={{ backgroundColor: 'transparent' }}
                                    onClick={() => {
                                        setShowSetting(true);
                                    }}
                                >
                                    <div className={cx('avatar_user')}>
                                        <div className={cx('action-btn')}>
                                            <img src={user?.urlAvatar} alt="user" />
                                        </div>
                                    </div>
                                </button>
                            </HeadlessTippy>
                        </>
                    ) : (
                        <>
                            <Button primary to={config.routes.login}>
                                {i18n.t('HEADER_login')}
                            </Button>
                            <Button outline to={config.routes.register}>
                                {i18n.t('HEADER_register')}
                            </Button>
                            <HeadlessTippy
                                interactive
                                placement="bottom-end"
                                visible={showSetting}
                                render={(attrs) => (
                                    <div className={cx('setting-area')} tabIndex={-1} {...attrs}>
                                        <PopperWrapper>
                                            <Menu
                                                menuItem={finalMenu}
                                                setMenuItem={setFinalMenu}
                                                header={i18n.t('FINAL_setting')}
                                                setShowTab={setShowSetting}
                                            />
                                        </PopperWrapper>
                                    </div>
                                )}
                                onClickOutside={() => {
                                    setShowSetting(false);
                                }}
                            >
                                <button
                                    style={{ backgroundColor: 'transparent' }}
                                    onClick={() => {
                                        setShowSetting(true);
                                    }}
                                >
                                    <div className={cx('action-btn')}>
                                        <TripleDot />
                                    </div>
                                </button>
                            </HeadlessTippy>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
