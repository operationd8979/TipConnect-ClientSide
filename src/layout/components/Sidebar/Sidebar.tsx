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
    const [loading, setLoading] = useState(false);

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };

    const { socket, stompClient } = currentStomp;

    const { isLoggedIn, user, listFriend } = currentUser;

    const [query, setQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResponse>({ tinyUser: null, messages: [] });

    const showList = useCallback(() => {
        return listFriend.filter((f) => f.friend.fullName.trim().toLowerCase().includes(query.toLowerCase().trim()));
    }, [listFriend, query]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
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
                                        if (json.length > 0) {
                                            dispatch(getListFriendSuccess(json));
                                        }
                                    } catch (error) {
                                        jsonData = jsonData.substring(1);
                                        const json: FriendShip[] = JSON.parse('[' + jsonData + ']') as FriendShip[];
                                        if (json.length > 0) {
                                            dispatch(getListFriendSuccess(json));
                                        }
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
            if (listFriend.length == 0) {
                callApiGetFriend();
            }
        }
    }, []);

    const handleAddFriend = async () => {
        setLoading(true);
        if (searchResult.tinyUser) {
            const userID = searchResult.tinyUser.userID;
            const response = await UserService.addFriend(userID);
            if (response) {
                const res = response.data as Response;
                switch (res.code) {
                    case 200:
                        setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'ONSEND' } });
                        break;
                    case 409:
                        alert('Tin này không có sẵn');
                        setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'ONSEND' } });
                        break;
                    default:
                        alert(res.message);
                }
            } else {
                dispatch(logout());
            }
        }
        setLoading(false);
    };

    const handleCancelingFriendRequest = async () => {
        setLoading(true);
        if (searchResult.tinyUser) {
            const userID = searchResult.tinyUser.userID;
            const response = await UserService.cancelFriendRequest(userID);
            if (response) {
                const res = response.data as Response;
                switch (res.code) {
                    case 200:
                        setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'AVAIBLE' } });
                        break;
                    case 404:
                        alert('Tin này không có sẵn');
                        setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'AVAIBLE' } });
                        break;
                    case 409:
                        alert('Tin này không có sẵn');
                        setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'AVAIBLE' } });
                        break;
                    default:
                        alert(res.message);
                }
            } else {
                dispatch(logout());
            }
        }
        setLoading(false);
    };

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
                                <button className={cx('plus_button')} onClick={handleAddFriend} disabled={loading}>
                                    <PlusFriend />
                                </button>
                            )}
                            {searchResult.tinyUser.state == 'ONSEND' && (
                                <button
                                    className={cx('cancel_button')}
                                    onClick={handleCancelingFriendRequest}
                                    disabled={loading}
                                >
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
