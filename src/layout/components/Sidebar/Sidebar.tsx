import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Sidebar.module.scss';

import Search from '../Search';
import { PlusFriend, OnWait } from '../../../components/Icons';
import { State, FriendShip, SearchResponse, Response } from '../../../type';
import { UserService } from '../../../apiService/';
import { getListFriendSuccess, getListFriendFail, logout } from '../../../reducers';
import DataReconstruct from '../../../utils/DataReconstruct';

const cx = className.bind(styles);

function Sidebar() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;

    const [query, setQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResponse>({ tinyUser: null, messages: [] });

    const showList = useCallback(() => {
        return listFriend.filter((f) => f.friend.fullName.trim().toLowerCase().includes(query.toLowerCase().trim()));
    }, [listFriend, query]);

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
            <div className={cx('header')}>
                {isLoggedIn && <Search query={query} setQuery={setQuery} setSearchResult={setSearchResult} />}
                <button>tat ca</button>
                <button>|chua doc</button>
            </div>
            <div className={cx('friend_box')}>
                {searchResult.tinyUser && (
                    <div className={cx('aim-user')}>
                        <div className={cx('header_search')}>Tìm qua email:</div>
                        <div className={cx('friend_card')} key={searchResult.tinyUser.userID}>
                            <div className={cx('card_img')}>
                                <img src={searchResult.tinyUser.urlAvatar} alt={searchResult.tinyUser.fullName} />
                            </div>
                            <div className={cx('card_content')}>
                                <div className={cx('card_info')}>
                                    <div className={cx('info_name')}>{searchResult.tinyUser.fullName}</div>
                                    <div className={cx('info_detail')}>Email:{query}</div>
                                </div>
                                <div className={cx('card_action')}>
                                    {searchResult.tinyUser.state == 'AVAIBLE' && (
                                        <button
                                            className={cx('plus_button')}
                                            onClick={handleAddFriend}
                                            disabled={loading}
                                        >
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
                        </div>
                    </div>
                )}
                {showList().map((friendShip) => {
                    let showTime = 'now';

                    const { message, friend } = friendShip;

                    if (message?.timestamp) {
                        showTime = DataReconstruct.TranslateTimeStampToDisplayString(message.timestamp);
                    }
                    return (
                        <Link
                            className={cx('friend_card', { 'non-seen': !message?.seen })}
                            key={friendShip.id}
                            to={`/message/${friend.userID}`}
                        >
                            <div className={cx('card_img')}>
                                <img src={friend.urlAvatar} alt={friend.fullName} />
                            </div>
                            <div className={cx('card_content')}>
                                <div>
                                    <div className={cx('card_content')}>
                                        <div className={cx('info_name')}>{friend.fullName}</div>
                                        {showTime && <div className={cx('info_time')}>{showTime}</div>}
                                    </div>
                                    <div className={cx('info_detail')}>
                                        {message ? (
                                            <div>
                                                {message.user ? 'Bạn: ' : ''}
                                                {message.type == 'MESSAGE'
                                                    ? message.body.length > 32
                                                        ? message.body.substring(0, 32) + '...'
                                                        : message.body
                                                    : message.type}
                                            </div>
                                        ) : (
                                            <div>bắt đầu nhắn tin nào</div>
                                        )}

                                        {message && !message.seen && (
                                            <div className={cx('info_detail_count_income')}>5..</div>
                                        )}
                                    </div>
                                </div>
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
