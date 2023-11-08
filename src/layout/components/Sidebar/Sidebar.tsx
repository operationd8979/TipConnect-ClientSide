import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import className from 'classnames/bind';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getListFriendSucess, getListFriendFail } from '../../../reducers/userReducer/Action/Action';
import { State, FriendShip } from '../../../type';
import UserService from '../../../apiService/UserService';
import { Link } from 'react-router-dom';

const cx = className.bind(styles);

function Sidebar() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;
    const [friends, setFriends] = useState<FriendShip[]>(listFriend ?? []);

    const dispatch = useDispatch();

    useEffect(() => {
        if (currentUser.user) {
            console.log('Call api get listFriend');
            const callApiGetFriend = async () => {
                if (currentUser.user?.userId) {
                    try {
                        const response = await UserService.getListFriend(currentUser.user.userId);
                        if (response != undefined) {
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
                                            //console.log(json);
                                            setFriends((prevList) => [...prevList, ...json]);
                                        } catch (error) {
                                            jsonData = jsonData.substring(1);
                                            //console.log(jsonArray);
                                            const json: FriendShip[] = JSON.parse('[' + jsonData + ']') as FriendShip[];
                                            //console.log(json);
                                            setFriends((prevList) => [...prevList, ...json]);
                                        }
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        alert(error);
                        console.log(error);
                        dispatch(getListFriendFail());
                    }
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
                <button>tat ca</button>
                <button>|chua doc</button>
            </div>
            <div className={cx('friend_box')}>
                {friends.map((friendShip) => {
                    return (
                        <Link
                            className={cx('friend_card')}
                            key={friendShip.id}
                            to={`/message/${friendShip.friend.userId}`}
                        >
                            <img src={friendShip.friend.urlAvatar} alt={friendShip.friend.fullName} />
                            <p>{friendShip.friend.fullName}</p>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}

export default Sidebar;
