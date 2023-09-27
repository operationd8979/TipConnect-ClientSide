import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const Search = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState([]);

    return (
        <div className={cx('search')}>
            <input placeholder="Search accounts and videos" spellCheck={false} />
            {result.length > 0 && !loading && (
                <button className={cx('clear')}>
                    <FontAwesomeIcon icon={faCircleXmark} />
                </button>
            )}
            {loading && <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />}
            <button className={cx('search-btn')}>{/*Search */}</button>
        </div>
    );
};

export default Search;
