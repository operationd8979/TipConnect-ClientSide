import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { State } from '../../type';
import firebase from '../../firebase';
import classNames from 'classnames/bind';
import Styles from './Home.module.scss';

const cx = classNames.bind(Styles);

const Home = () => {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;

    useEffect(() => {}, []);
    return (
        <div className={cx('wrapper')}>
            <div className={cx('login-area')}>
                Chào mừng bạn đến với <b>TipConnect</b>
                <br />
                Khám phá những tiện ích kết nối với bạn bè và đồng nhiệp.
            </div>
        </div>
    );
};

export default Home;
