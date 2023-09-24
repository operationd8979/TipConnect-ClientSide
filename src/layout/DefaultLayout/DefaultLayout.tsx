import { Header } from '../components';
import Sidebar from './Sidebar';
import styles from './DefaultLayout.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

function DefaultLayout({ children }: { children: JSX.Element }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <Sidebar />
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default DefaultLayout;
