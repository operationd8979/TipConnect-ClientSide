import { useCallback, useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import className from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import { getListFriendSucess, getListFriendFail, logout } from '../../../reducers/userReducer/Action/Action';
import { State, FriendShip, SearchResponse } from '../../../type';
import UserService from '../../../apiService/UserService';
import { Link, useNavigate } from 'react-router-dom';
import Search from '../Search';

const cx = className.bind(styles);

function Sidebar() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;
    const [friends, setFriends] = useState<FriendShip[]>(listFriend ?? []);

    const [query, setQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResponse>({ tinyUser: null, messages: [] });

    const showList = useCallback(() => {
        return friends.filter((f) => f.friend.fullName.trim().toLowerCase().includes(query.toLowerCase().trim()));
    }, [friends, query]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser.user) {
            console.log('Call api get listFriend');
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
                                    console.log('Streaming data ended!');
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
                        if (response === undefined) {
                            localStorage.removeItem('currentUser');
                            dispatch(logout());
                            navigate('/login');
                        } else if (response?.status == 403) {
                            localStorage.removeItem('currentUser');
                            dispatch(logout());
                            navigate('/login');
                        }
                    }
                } catch (error) {
                    alert(error);
                    console.log(error);
                    dispatch(getListFriendFail());
                }
            };
            if (friends.length == 0) callApiGetFriend();
        }
    }, []);

    useEffect(() => {
        if (friends.length != 0) {
            dispatch(getListFriendSucess(friends));
        }
    }, [listFriend]);

    return (
        <aside className={cx('wrapper')}>
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
