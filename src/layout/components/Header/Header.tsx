import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import styles from './Header.module.scss';
import config from '../../../config';
import images from '../../../assets/images';
import { InboxIcon, MessageIcon, UploadIcon } from '../../../components/Icons';
import Button from '../../../components/Button';
import Search from '../Search';
import i18n from '../../../i18n/i18n';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { State, FriendShip } from '../../../type';
import UserService from '../../../apiService/UserService';
import FriendList from './FriendList';
import { useDispatch } from 'react-redux';
import {getListFriendSucess, getListFriendFail} from '../../../reducers/userReducer/Action/Action'


const cx = classNames.bind(styles);

function Header() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user } = currentUser;
    const [listFriend, setListFriend] = useState<FriendShip[]>([]);
    const [history,setHistory] = useState(0);
    //const memoizedListFriend = useMemo(() => currentUser.listFriend, [currentUser.listFriend]);

    const dispatch = useDispatch();

    useEffect(() => {
        if (currentUser.user) {
            console.log('Call api get listFriend');
            const callApiGetFriend = async () => {
                if (currentUser.user?.userId) {
                    try {
                        const response = await UserService.getListFriend(currentUser.user.userId);
                        if (response) {
                            const reader = response.body?.getReader();
                            if (reader) {
                                const decoder = new TextDecoder();
                                while (true) {
                                    const { done, value }: any = await reader.read(); //outputStream
                                    if (done) {
                                        console.log('Streaming data ended');
                                        break;
                                    }
                                    let jsonData = decoder.decode(value, { stream: true });
                                    const array = jsonData.split("]");

                                    array.forEach((jsonArray)=>{
                                        try{
                                            const json:FriendShip[] = JSON.parse(jsonArray+"]") as FriendShip[];
                                            //console.log(json);
                                            dispatch(getListFriendSucess(json));
                                            //setListFriend((prevList) => [...prevList, ...json]);
                                        }catch(error){
                                            jsonArray = jsonArray.substring(1);
                                            console.log(jsonArray);
                                            const json:FriendShip[] = JSON.parse("["+jsonArray+"]") as FriendShip[];
                                            //console.log(json);
                                            dispatch(getListFriendSucess(json));
                                            //setListFriend((prevList) => [...prevList, ...json]);
                                        }
                                    })
                                }
                            }
                        }
                    } catch (error) {
                        alert(error);
                        console.log(error);
                        //dispatch
                    }
                }
            };
            callApiGetFriend();
        }
    }, []);

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <FriendList listFriend = {currentUser.listFriend??[]}/>
                <Link to={config.routes.home} className={cx('logo')}>
                    <img src={images.logo} alt="TipConnect" />
                </Link>
                {isLoggedIn && <Search />}
                <div className={cx('actions')}>
                    {isLoggedIn ? (
                        <>
                            <Tippy delay={[0, 50]} content="Upload video" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <UploadIcon />
                                </button>
                            </Tippy>
                            <Tippy delay={[0, 50]} content="Message" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <MessageIcon />
                                </button>
                            </Tippy>
                            <Tippy delay={[0, 50]} content="Inbox" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <InboxIcon />
                                    <span className={cx('badge')}>12</span>
                                </button>
                            </Tippy>
                            <Tippy delay={[0, 50]} content="UserAvatar" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <img src={currentUser.user?.urlAvatar} alt="user" className={cx('avatar_user')} />
                                </button>
                            </Tippy>
                        </>
                    ) : (
                        <>
                            <Button primary to={config.routes.login}>
                                {i18n.t('login')}
                            </Button>
                            <Button outline to={config.routes.register}>
                                {i18n.t('register')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
