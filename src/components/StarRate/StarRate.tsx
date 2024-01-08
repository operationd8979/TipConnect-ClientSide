import React from 'react'
import { StarFullIcon, StarIcon } from '../Icons'
import styles from './StarRate.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);
export default function StarRate({rate}: {rate: number}) {
  return (
    <div>
      {/*2rem = 1 star*/}
      <div className={cx('start-fill')} style={{ width: (rate) * 2 + 'rem' }}>
        <StarFullIcon />
        <StarFullIcon />
        <StarFullIcon />
        <StarFullIcon />
        <StarFullIcon />
      </div>
      <div>
        <StarIcon />
        <StarIcon />
        <StarIcon />
        <StarIcon />
        <StarIcon />
      </div>
    </div>
  )
}
