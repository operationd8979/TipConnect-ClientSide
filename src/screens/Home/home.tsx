import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './Home.module.scss';
import { UserService } from '../../apiService';
import { getGifItems } from '../../reducers';

import { Gif, State } from '../../type';

const cx = classNames.bind(Styles);

const Home = () => {
    const dispatch = useDispatch();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend, listGifItem } = currentUser;

    useEffect(() => {
        const callApiGetGifItems = async () => {
            try {
                const response = await UserService.getGifItems();
                if (response?.ok) {
                    response.json().then((data) => {
                        dispatch(getGifItems(data));
                    });
                } else {
                    if (response === null || response?.status == 403) {
                        console.log('get fail');
                    }
                }
            } catch (error) {
                alert(error);
                console.log(error);
            }
        };
        if (listGifItem.length === 0) callApiGetGifItems();
    }, []);

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
