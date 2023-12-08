import classNames from 'classnames/bind';
import Styles from './Menu.module.scss';
import { Link } from 'react-router-dom';
import { ArrowBack } from '../Icons';
import { SettingItem } from '../../type';

const cx = classNames.bind(Styles);

interface Menu {
    header: string;
    menuItem: SettingItem[][];
    setMenuItem: React.Dispatch<React.SetStateAction<SettingItem[][]>>;
    setShowTab: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = ({ header, menuItem, setMenuItem, setShowTab }: Menu) => {
    const handleClickItem = (item: SettingItem) => {
        if (item.children) {
            setMenuItem([...menuItem, item.children]);
        } else {
            if (item.onClick) item.onClick();
            if (menuItem.length > 1) {
                handleBack();
            }
            setShowTab(false);
        }
    };

    const handleBack = () => {
        if (menuItem.length > 1) setMenuItem((prev) => prev.slice(0, prev.length - 1));
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                {header}{' '}
                {menuItem.length > 1 && (
                    <button onClick={handleBack}>
                        <ArrowBack />
                    </button>
                )}
            </div>
            {menuItem[menuItem.length - 1].map((item) => {
                if (item.to) {
                    return (
                        <Link className={cx('item-wrapper')} to={item.to}>
                            {item.title}
                            {item.icon}
                        </Link>
                    );
                }
                if (item.onClick) {
                    return (
                        <button className={cx('item-wrapper')} onClick={() => handleClickItem(item)}>
                            {item.title}
                            {item.icon}
                        </button>
                    );
                }
                return <></>;
            })}
        </div>
    );
};
export default Menu;
