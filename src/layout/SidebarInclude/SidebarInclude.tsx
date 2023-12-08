import { Header, Sidebar } from '../components';
import styles from './SidebarInclude.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

function SidebarInclude({ children }: { children: JSX.Element }) {
    return (
        <div className={cx('wrraper')}>
            <div className={cx('sidebar')}>
                <Sidebar />
            </div>
            <div className={cx('content')}>{children}</div>
        </div>
    );
}

export default SidebarInclude;
