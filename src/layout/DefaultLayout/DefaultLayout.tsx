import { Header } from '../components';
import styles from './DefaultLayout.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

const DefaultLayout = ({ children }: { children: JSX.Element[] | JSX.Element }) => {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('load')}>{children}</div>
            </div>
        </div>
    );
};

export default DefaultLayout;
