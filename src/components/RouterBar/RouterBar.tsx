import React from 'react';
import styles from './RouterBar.module.scss';
import className from 'classnames/bind';
import { Routing } from '../../type';
import { HomeWhiteIcon, RightChevronIcon } from '../../components/Icons';

const cx = className.bind(styles);
const RouterBar = ({ parent, children1, children2, endpoint }: Routing) => {
    return (
        <div className={cx('wrapper')}>
            <span>
                <HomeWhiteIcon width="2rem" height="2rem" className={cx('home-icon')} />
                {parent}
            </span>
            {children1 && (
                <span>
                    <RightChevronIcon />
                    {children1}
                </span>
            )}
            {children2 && (
                <span>
                    <RightChevronIcon />
                    {children2}
                </span>
            )}
            <span>
                <RightChevronIcon />
                {endpoint}
            </span>
        </div>
    );
};

export default RouterBar;
