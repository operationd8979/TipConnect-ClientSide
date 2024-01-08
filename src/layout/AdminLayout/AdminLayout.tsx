import { useState, useEffect } from 'react';
import styles from './AdminLayout.module.scss';
import className from 'classnames/bind';
import { Link } from 'react-router-dom';
import config from '../../config';
import {
    ContentIcon,
    DashboardIcon,
    AnalyticsIcon,
    CommentsIcon,
    SubtitlesIcon,
    CopyrightIcon,
    CustomisationIcon,
    SettingIcon,
    UserIcon,
} from '../../components/Icons';

const cx = className.bind(styles);
function AdminLayout({ children }: { children: JSX.Element[] | JSX.Element }) {
    const [isFloating, setIsFloating] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsFloating(scrollY > 90);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <div className={cx('wrapper')}>
            <div className={cx('wrapper-left', isFloating ? 'floating' : '')}>
                <div className={cx('link-section')}>
                    <Link to={config.routes.dashBoard}>
                        <DashboardIcon />
                        <span>Dashboard</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to={config.routes.content}>
                        <ContentIcon />
                        <span>Movie Manage</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to={config.routes.userManager}>
                        <UserIcon />
                        <span>User Manage</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to="">
                        <AnalyticsIcon />
                        <span>Analytics</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to="">
                        <CommentsIcon />
                        <span>Comments</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to="">
                        <SubtitlesIcon />
                        <span>Subtitles</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to="">
                        <CopyrightIcon />
                        <span>Copyright</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to="">
                        <CustomisationIcon />
                        <span>Customisation</span>
                    </Link>
                </div>
                <div className={cx('link-section')}>
                    <Link to="">
                        <SettingIcon />
                        <span>Setting</span>
                    </Link>
                </div>
            </div>
            <div className={cx('wrapper-right')}>{children}</div>
        </div>
    );
}

export default AdminLayout;
