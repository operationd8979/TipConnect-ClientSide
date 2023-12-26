import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './Home.module.scss';
import { UserService } from '../../apiService';
import { getGifItems } from '../../reducers';

import { State, User } from '../../type';
import Button from '../../components/Button';

const cx = classNames.bind(Styles);

const Home = () => {
    const dispatch = useDispatch();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listRelationShip, listGifItem, i18n } = currentUser;
    const [livers, setLivers] = useState<User[]>([]);

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

    useEffect(() => {
        const callGetListLive = async () => {
            try {
                const response = await UserService.getListLive();
                if (response?.ok) {
                    response.json().then((data) => {
                        console.log(data);
                        setLivers(data);
                    });
                } else {
                    if (response === null || response?.status == 403) {
                        console.log('get fail');
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        if (isLoggedIn) {
            callGetListLive();
        }
    }, [isLoggedIn]);

    const handleWatchLive = (liveID: string) => {
        window.open(`/watch/${liveID}`, '_blank', 'width=1920,height=1080');
    };

    return (
        <div className={cx('wrapper')}>
            {!isLoggedIn ? (
                <div className={cx('login-area')}>
                    {i18n.t('HOME_WELCOME_DES')} <b>{i18n.t('FINAL_NAME_APP')}</b>
                    <br />
                    {i18n.t('HOME_INRO_DES')}
                </div>
            ) : (
                <div className={cx('live-area')}>
                    <div className={cx('live-area-header')}>LIVE STREAM</div>
                    <div className={cx('live-area-content')}>
                        {livers.map((liver) => {
                            return (
                                <div className={cx('live-item')}>
                                    <div className={cx('live-image')}>
                                        <img src={liver.urlAvatar} />
                                    </div>
                                    <div className={cx('live-name')}>
                                        <div>{liver.fullName}</div>
                                        <div className={cx('living')}>Living</div>
                                        <Button
                                            primary
                                            onClick={() => {
                                                handleWatchLive(liver.userID);
                                            }}
                                        >
                                            Xem live ngay
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
