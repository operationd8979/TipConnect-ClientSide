import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import images from '../../../../assets/images';
import Button from '../../../Button';

const cx = classNames.bind(styles);

function Header() {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('logo')}>
                    <img src={images.logo} alt="TipConnect" />
                </div>
                <div className={cx('search')}>
                    <input placeholder="Search accounts and videos" spellCheck={false} />
                    <button className={cx('clear')}>{/*Clear */}</button>
                    {/*Loading */}
                    <button className={cx('search-btn')}>{/*Search */}</button>
                </div>
                <div className={cx('actions')}>
                    <Button>action</Button>
                </div>
            </div>
        </header>
    );
}

export default Header;
