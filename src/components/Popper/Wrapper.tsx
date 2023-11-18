import classNames from 'classnames/bind';
import styles from './Popper.module.scss';

const cx = classNames.bind(styles);

interface Wrapper {
    children: JSX.Element | JSX.Element[] | any;
    className?: string;
}

function Wrapper({ children, className }: Wrapper) {
    return <div className={cx('wrapper', className)}>{children}</div>;
}

export default Wrapper;
