import { useCallback, useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import className from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import {
    getListFriendSuccess,
    getListFriendFail,
    logout,
    connectSuccess,
    connectFail,
    disconnect,
    updateUserInfoSuccess,
    updateUserInfoFail,
} from '../../../reducers';
import { State, FriendShip, SearchResponse, AuthenticationReponse, Response } from '../../../type';
import { Client } from 'webstomp-client';
import { UserService, SocketService } from '../../../apiService/';
import { Link, useNavigate } from 'react-router-dom';
import Search from '../Search';
import { PlusFriend, OnWait, Close } from '../../../components/Icons';

const cx = className.bind(styles);

function Sidebar() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };

    const { socket, stompClient } = currentStomp;

    const { isLoggedIn, user, listFriend } = currentUser;
    const [friends, setFriends] = useState<FriendShip[]>(listFriend ?? []);

    const [query, setQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResponse>({ tinyUser: null, messages: [] });

    const showList = useCallback(() => {
        return friends.filter((f) => f.friend.fullName.trim().toLowerCase().includes(query.toLowerCase().trim()));
    }, [friends, query]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // stomp.subscribe('/users/private', function (message) {
    //     console.log('nhận tin nhắn private:' + message.body);
    // });
    // stomp.subscribe('/all/messages', function (message) {
    //     console.log('nhận tin nhắn all:' + message.body);
    // });

    useEffect(() => {
        return () => {
            if (stompClient.connected) {
                SocketService.disconnectStomp(stompClient);
            }
        };
    }, []);

    useEffect(() => {
        if (stompClient.connected) {
            console.log('<<<<<<<<<<<<<<<<1>>>>>>>>>>>>>>>>');
            if (user) {
                const callApiGetFriend = async () => {
                    try {
                        const response = await UserService.getListFriend();
                        if (response?.ok) {
                            const reader = response.body?.getReader();
                            if (reader) {
                                const decoder = new TextDecoder();
                                while (true) {
                                    const { done, value }: any = await reader.read();
                                    if (done) {
                                        console.log('Streaming data friends ended!');
                                        break;
                                    }
                                    let jsonString = decoder.decode(value, { stream: true });
                                    const jsonArray = jsonString.split(']');

                                    jsonArray.forEach((jsonData) => {
                                        try {
                                            const json: FriendShip[] = JSON.parse(jsonData + ']') as FriendShip[];
                                            setFriends((prevList) => [...prevList, ...json]);
                                        } catch (error) {
                                            jsonData = jsonData.substring(1);
                                            const json: FriendShip[] = JSON.parse('[' + jsonData + ']') as FriendShip[];
                                            setFriends((prevList) => [...prevList, ...json]);
                                        }
                                    });
                                }
                            }
                        } else {
                            if (response === null || response?.status == 403) {
                                dispatch(getListFriendFail());
                                navigate('/login');
                            }
                        }
                    } catch (error) {
                        alert(error);
                        console.log(error);
                        dispatch(getListFriendFail());
                        navigate('/login');
                    }
                };
                if (friends.length == 0) {
                    callApiGetFriend();
                }
            }
        } else {
            console.log('<<<<<<<<<<<<<<<<2>>>>>>>>>>>>>>>>');
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
                                console.log('nhận tin nhắn private:' + message.body);
                                console.log(message);
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
    }, [currentStomp]);

    useEffect(() => {
        if (friends.length != listFriend?.length) {
            dispatch(getListFriendSuccess(friends));
        }
    }, [friends]);

    const handleAddFriend = async () => {
        if (searchResult.tinyUser) {
            const userID = searchResult.tinyUser.userID;
            const response = await UserService.addFriend(userID);
            if (response) {
                const res = response.data as Response;
                if (res.code === 200) {
                    setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'ONSEND' } });
                }
            }
        }
    };

    function sendMessageAll() {
        if (stompClient) {
            stompClient.send(
                '/app/all',
                JSON.stringify({
                    from: 'ChipChip',
                    body: 'hello world',
                }),
            );
            console.log('đã gửi tin nhắn');
        }
    }

    return (
        <aside className={cx('wrapper')}>
            {/* <button onClick={sendMessageAll}>send</button> */}
            <div className={cx('header')}>
                {isLoggedIn && <Search query={query} setQuery={setQuery} setSearchResult={setSearchResult} />}
                <button>tat ca</button>
                <button>|chua doc</button>
            </div>
            <div className={cx('friend_box')}>
                {searchResult.tinyUser && (
                    <div>
                        <div className={cx('header_search')}>Tìm qua email:</div>
                        <div className={cx('friend_card')} key={searchResult.tinyUser.userID}>
                            <div className={cx('card_img')}>
                                <img src={searchResult.tinyUser.urlAvatar} alt={searchResult.tinyUser.fullName} />
                            </div>
                            <div className={cx('card_info')}>
                                <div className={cx('card_name')}>{searchResult.tinyUser.fullName}</div>
                                <div className={cx('card_detail')}>Email:{query}</div>
                            </div>
                            {searchResult.tinyUser.state == 'AVAIBLE' && (
                                <button className={cx('plus_button')} onClick={handleAddFriend}>
                                    <PlusFriend />
                                </button>
                            )}
                            {searchResult.tinyUser.state == 'ONSEND' && (
                                <button className={cx('cancel_button')} onClick={handleAddFriend}>
                                    <OnWait />
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {showList().map((friendShip) => {
                    return (
                        <Link
                            className={cx('friend_card')}
                            key={friendShip.id}
                            to={`/message/${friendShip.friend.userID}`}
                        >
                            <div className={cx('card_img')}>
                                <img src={friendShip.friend.urlAvatar} alt={friendShip.friend.fullName} />
                            </div>
                            <div className={cx('card_info')}>
                                <div className={cx('card_name')}>{friendShip.friend.fullName}</div>
                                <div className={cx('card_detail')}>message</div>
                            </div>
                        </Link>
                    );
                })}
                {searchResult.messages.length > 0 && (
                    <div>
                        <div>Tin nhắn</div>
                        {/* <div className={cx('friend_card')} key={searchResult.tinyUser.userId}>
                            <img src={searchResult.tinyUser.urlAvatar} alt={searchResult.tinyUser.fullName} />
                            <p>{searchResult.tinyUser.fullName}</p>
                            <p>{searchResult.tinyUser.role}</p>
                        </div> */}
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
