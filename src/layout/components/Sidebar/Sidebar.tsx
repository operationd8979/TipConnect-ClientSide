import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Sidebar.module.scss';
import HeadlessTippy from '@tippyjs/react/headless';

import Search from '../Search';
import { Wrapper } from '../../../components/Popper';
import { PlusFriend, OnWait, TagItem, ArrowShow, Close } from '../../../components/Icons';
import { State, FriendShip, SearchResponse, Response } from '../../../type';
import { UserService } from '../../../apiService/';
import { getListFriendSuccess, getListFriendFail, updateLastMessage, logout } from '../../../reducers';
import DataReconstruct from '../../../utils/DataReconstruct';
import hardData from '../../../contants/hardData';
import Button from '../../../components/Button';

const cx = className.bind(styles);

function Sidebar() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend, i18n } = currentUser;

    const [query, setQuery] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchResponse>({ tinyUser: null, messages: [] });
    const [triggerLoadMore, setTriggerLoadMore] = useState<boolean>(true);
    const [showLoadMore, setShowLoadMore] = useState<boolean>(false);

    const [isNonSeen, setIsNonSeen] = useState<boolean>(false);

    const [showTypeTab, setShowTypeTab] = useState(false);
    const [typeSelect, setTypeSelect] = useState<number>(0);

    const showList = useCallback(() => {
        return listFriend.filter(
            (f) =>
                (typeSelect === 0 || f.type === hardData.typeFriendShip[typeSelect - 1].name) &&
                (!f.message || !isNonSeen || (!f.message.seen && !f.message.user)) &&
                f.friend.fullName.trim().toLowerCase().includes(query.toLowerCase().trim()),
        );
    }, [listFriend, query, isNonSeen, typeSelect]);

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
                        alert(i18n.t('FINAL_UNAVAILABLE_MESSAGE'));
                        setSearchResult({ ...searchResult, tinyUser: { ...searchResult.tinyUser, state: 'AVAIBLE' } });
                        break;
                    case 409:
                        alert(i18n.t('FINAL_UNAVAILABLE_MESSAGE'));
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

    const handleLoadMore = () => {
        setTriggerLoadMore(!triggerLoadMore);
    };

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('header')}>
                {isLoggedIn && (
                    <Search
                        query={query}
                        setQuery={setQuery}
                        setSearchResult={setSearchResult}
                        searchResult={searchResult}
                        triggerLoadMore={triggerLoadMore}
                        setShowLoadMore={setShowLoadMore}
                    />
                )}
                <div className={cx('controll-area')}>
                    <div className={cx('controll-area-fillter-button')}>
                        <button
                            onClick={() => {
                                setIsNonSeen(false);
                            }}
                        >
                            {i18n.t('SIDEBAR_ALL_MESSAGE')}
                        </button>
                        <button
                            onClick={() => {
                                setIsNonSeen(true);
                            }}
                        >
                            |{i18n.t('SIDEBAR_UNSEEN_MESSAGE')}
                        </button>
                    </div>
                    <HeadlessTippy
                        placement="bottom"
                        visible={showTypeTab}
                        interactive
                        onClickOutside={() => {
                            setShowTypeTab(false);
                        }}
                        render={(attrs) => (
                            <div className={cx('controll-area-filter-type')} tabIndex={-1} {...attrs}>
                                <Wrapper>
                                    {hardData.typeFriendShip.map((type: { code: number; name: string }) => {
                                        const { code, name } = type;
                                        return (
                                            <div className={cx('controll-area-filter-type-item')} key={code}>
                                                <button
                                                    onClick={() => {
                                                        setTypeSelect(code);
                                                    }}
                                                >
                                                    <TagItem className={cx({ [name]: true })} />
                                                    {name}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </Wrapper>
                            </div>
                        )}
                    >
                        <div
                            className={cx('controll-area-filter-type-choose', {
                                noActive: typeSelect === 0,
                            })}
                        >
                            <button
                                onClick={() => {
                                    setShowTypeTab(!showTypeTab);
                                }}
                            >
                                {typeSelect === 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {i18n.t('SIDEBAR_CHOOSE_TYPE_FRIEND')}
                                        <ArrowShow />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {hardData.typeFriendShip[typeSelect - 1].name}
                                        <div className={cx('controll-area-filter-type-close-button')}>
                                            <button
                                                onClick={() => {
                                                    setTypeSelect(0);
                                                }}
                                            >
                                                <Close />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </div>
                    </HeadlessTippy>
                </div>
            </div>
            <div className={cx('friend_box')}>
                {searchResult.tinyUser && (
                    <div className={cx('aim-user')}>
                        <div className={cx('header_search')}>{i18n.t('SIDEBAR_search_by_email')}</div>
                        <div className={cx('friend_card')} key={searchResult.tinyUser.userID}>
                            <div className={cx('card_img')}>
                                <img src={searchResult.tinyUser.urlAvatar} alt={searchResult.tinyUser.fullName} />
                            </div>
                            <div className={cx('card_content')}>
                                <div className={cx('card_info')}>
                                    <div className={cx('info_name')}>{searchResult.tinyUser.fullName}</div>
                                    <div className={cx('info_detail')}>
                                        {i18n.t('FINAL_email')}:{query}
                                    </div>
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
                                            {i18n.t('FINAL_dispose')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {typeSelect !== 0 && <div>{hardData.typeFriendShip[typeSelect - 1].name}</div>}
                {showList().map((friendShip) => {
                    let showTime = 'now';
                    let online = false;
                    const { message, friend, timeStamp } = friendShip;
                    if (message?.timestamp) {
                        showTime = DataReconstruct.TranslateTimeStampToDisplayString(message.timestamp);
                    }
                    if (timeStamp) {
                        online = new Date().getTime() - Number(timeStamp) < 60000;
                    }
                    return (
                        <Link
                            className={cx('friend_card', {
                                'non-seen': message && !message.seen && !message.user,
                                online: online,
                            })}
                            key={friendShip.id}
                            onClick={() => {
                                if (friendShip?.message) {
                                    if (!friendShip.message.seen) {
                                        let newMessage = friendShip.message;
                                        newMessage.seen = true;
                                        dispatch(updateLastMessage(newMessage));
                                    }
                                }
                            }}
                            to={`/message/${friend.userID}`}
                        >
                            <div className={cx('card_img')}>
                                <img src={friend.urlAvatar} alt={friend.fullName} />
                            </div>
                            <div className={cx('card_content')}>
                                <div style={{ width: '100%' }}>
                                    <div className={cx('card_holder')}>
                                        <div className={cx('info_name')}>{friend.fullName}</div>
                                        {showTime && <div className={cx('info_time')}>{showTime}</div>}
                                    </div>
                                    <div className={cx('info_detail')}>
                                        {message ? (
                                            <div>
                                                {message.user ? 'Bạn: ' : ''}
                                                {message.type === 'MESSAGE'
                                                    ? message.body.length > 32
                                                        ? message.body.substring(0, 32) + '...'
                                                        : message.body
                                                    : message.type}
                                            </div>
                                        ) : (
                                            <div>{i18n.t('SIDEBAR_let_chat')}</div>
                                        )}
                                        {message && !message.seen && !message.user && (
                                            <div className={cx('info_detail_count_income')}>...</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                {searchResult.messages.length > 0 && (
                    <div>
                        <div className={cx('header_search')}>{i18n.t('FINAL_message')}</div>
                        {searchResult.messages.map((message, index) => {
                            let showTime = 'now';
                            const friendShip = listFriend.find(
                                (c) => c.friend.userID === message.from || c.friend.userID === message.to,
                            );
                            if (!friendShip) {
                                return;
                            }
                            const { friend } = friendShip;
                            if (message.timestamp) {
                                showTime = DataReconstruct.TranslateTimeStampToDisplayString(message.timestamp);
                            }
                            return (
                                <div className={cx('friend_card')} key={index}>
                                    <div className={cx('card_img')}>
                                        <img src={friend.urlAvatar} alt={friend.fullName} />
                                    </div>
                                    <div className={cx('card_content')}>
                                        <div style={{ width: '100%' }}>
                                            <div className={cx('card_holder')}>
                                                <div className={cx('info_name')}>{friend.fullName}</div>
                                                {showTime && <div className={cx('info_time')}>{showTime}</div>}
                                            </div>
                                            <div className={cx('info_detail')}>
                                                <div>
                                                    {message.user ? `${i18n.t('FINAL_you')}: ` : ''}
                                                    {message.type === 'MESSAGE'
                                                        ? message.body.length > 32
                                                            ? message.body.substring(0, 32) + '...'
                                                            : message.body
                                                        : message.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {showLoadMore && (
                    <div className={cx('load-more')}>
                        <button onClick={handleLoadMore}>{i18n.t('SIDEBAR_search_more')}</button>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
