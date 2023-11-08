import { Header, Sidebar } from '../components';
import styles from './DefaultLayout.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

function DefaultLayout({ children }: { children: JSX.Element }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('sidebar')}>
                    <Sidebar />
                </div>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default DefaultLayout;
