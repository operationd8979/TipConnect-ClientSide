import { Header } from '../components';
import styles from './OnlyHeader.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

const OnlyHeader = ({ children }: { children: JSX.Element }) => {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
};

export default OnlyHeader;
