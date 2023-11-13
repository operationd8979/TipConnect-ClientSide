import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import styles from './Header.module.scss';
import config from '../../../config';
import images from '../../../assets/images';
import { InboxIcon, MessageIcon, UploadIcon } from '../../../components/Icons';
import Button from '../../../components/Button';
import i18n from '../../../i18n/i18n';
import { useSelector } from 'react-redux';
import { State } from '../../../type';

const cx = classNames.bind(styles);

function Header() {
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user } = currentUser;

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
                            </Tippy>
                            <Tippy delay={[0, 50]} content="Inbox" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <InboxIcon />
                                    <span className={cx('badge')}>12</span>
                                </button>
                            </Tippy> */}
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
