import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './Home.module.scss';
import { UserService } from '../../apiService';
import { getGifItems } from '../../reducers';

import { State } from '../../type';

const cx = classNames.bind(Styles);

const Home = () => {
    const dispatch = useDispatch();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend, listGifItem, i18n } = currentUser;

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
                {i18n.t('HOME_WELCOME_DES')} <b>{i18n.t('FINAL_NAME_APP')}</b>
                <br />
                {i18n.t('HOME_INRO_DES')}
                {/* <video
                    src="http://localhost:8080/api/user/live/live.mp4"
                    controls
                    autoPlay
                    muted
                    loop
                    width={400}
                    height={400}
                    itemType="video/mp4"
                /> */}
            </div>
        </div>
    );
};

export default Home;
