import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import HeadlessTippy from '@tippyjs/react/headless';
import styles from './Header.module.scss';
import config from '../../../config';
import images from '../../../assets/images';
import { InboxIcon, MessageIcon, UploadIcon, CheckIcon, UncheckIcon, Close } from '../../../components/Icons';
import Button from '../../../components/Button';
import i18n from '../../../i18n/i18n';
import { useSelector } from 'react-redux';
import { State } from '../../../type';
import { useState } from 'react';
import { Wrapper as PopperWrapper } from '../../../components/Popper';

const cx = classNames.bind(styles);

function Header() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user } = currentUser;
    const [showNotification, setShowNotification] = useState(false);

    const handleHideNotification = () => {
        setShowNotification(false);
    };

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link to={config.routes.home} className={cx('logo')}>
                    <img src={images.logo} alt="TipConnect" />
                </Link>
                <div className={cx('actions')}>
                    {isLoggedIn ? (
                        <>
                            {/* <Tippy delay={[0, 50]} content="Upload video" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <UploadIcon />
                                </button>
                            </Tippy>
                            <Tippy delay={[0, 50]} content="Message" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <MessageIcon />
                                </button>
                            </Tippy> */}
                            <div>
                                <HeadlessTippy
                                    interactive
                                    visible={showNotification}
                                    render={(attrs) => (
                                        <div className={cx('notification-area')} tabIndex={-1} {...attrs}>
                                            <PopperWrapper>
                                                <h4 className={cx('notification-title')}>Yêu cầu kết bạn</h4>
                                                <div className={cx('notification-item')} key={user?.userID}>
                                                    <div className={cx('notification-image')}>
                                                        <img src={user?.urlAvatar} alt={user?.fullName} />
                                                    </div>
                                                    <div className={cx('notification-info')}>
                                                        <div className={cx('notification-name')}>{user?.fullName}</div>
                                                        <div className={cx('notification-content')}>
                                                            Email:{user?.email}
                                                        </div>
                                                    </div>
                                                    <div className={cx('notification-action-area')}>
                                                        <button
                                                            className={cx('plus_button')}
                                                            onClick={() => {
                                                                alert('press');
                                                            }}
                                                        >
                                                            <CheckIcon />
                                                        </button>
                                                        <button
                                                            className={cx('cancel_button')}
                                                            onClick={() => {
                                                                alert('press');
                                                            }}
                                                        >
                                                            <Close />
                                                        </button>
                                                    </div>
                                                </div>
                                            </PopperWrapper>
                                        </div>
                                    )}
                                    onClickOutside={handleHideNotification}
                                >
                                    <button
                                        className={cx('action-btn')}
                                        onClick={() => {
                                            setShowNotification(true);
                                        }}
                                    >
                                        <InboxIcon />
                                        <span className={cx('badge')}>12</span>
                                    </button>
                                </HeadlessTippy>
                            </div>
                            <Tippy delay={[0, 50]} content="User profile" placement="bottom">
                                <Link to="/profile" className={cx('avatar_user')}>
                                    <button className={cx('action-btn')}>
                                        <img src={user?.urlAvatar} alt="user" />
                                    </button>
                                </Link>
                            </Tippy>
                        </>
                    ) : (
                        <>
                            <Button primary to={config.routes.login}>
                                {i18n.t('HEADER_login')}
                            </Button>
                            <Button outline to={config.routes.register}>
                                {i18n.t('HEADER_register')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
