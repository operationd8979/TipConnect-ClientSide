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
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { State, FriendShip } from '../../../type';
import UserService from '../../../apiService/UserService';

const cx = classNames.bind(styles);

function Header() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user } = currentUser;
    const [listFriend, setListFriend] = useState<string[]>([]);

    useEffect(() => {
        let string1 = `
        [{
            "id": "1",
            "firstName": "Dung"
        }`;
        let string2 = `
        ,{
            "id": "1",
            "firstName": "Dung"
        }`;
        let string3 = `
        ,{
            "id": "1",
            "firstName": "Dung"
        }]`;

        // string1 = string1.replace(',{', '[{');
        // string1 = string1.replace('}', '}]');
        // console.log(string1);
        // console.log(JSON.parse(string1));

        // string2 = string2.replace(',{', '[{');
        // string2 = string2.replace('}', '}]');
        // console.log(string2);
        // //console.log(JSON.parse(string2));

        // string3 = string3.replace(',{', '[{');
        // string3 = string3.replace('} ', '}]');
        // console.log(string3);
        //console.log(JSON.parse(string3));

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

                                    jsonData = jsonData.replace(',{', '{');
                                    try {
                                        const data = await JSON.parse(jsonData);
                                        console.log(data);
                                        console.log('--------------------------------');
                                    } catch (error) {
                                        if (jsonData.startsWith('[{')) {
                                            jsonData = jsonData.replace('[{', '{');
                                            const data = await JSON.parse(jsonData);
                                            console.log(data);
                                            console.log('--------------------------------');
                                        } else {
                                            jsonData = jsonData.replace('}]', '}');
                                            const data = await JSON.parse(jsonData);
                                            console.log(data);
                                            console.log('--------------------------------');
                                        }
                                    }
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
                <div>
                    {listFriend.map((listFriend) => {
                        return <p>{listFriend}</p>;
                    })}
                </div>
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
