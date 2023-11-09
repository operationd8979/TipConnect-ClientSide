import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import i18n from '../../../i18n/i18n';
import { useDebounce } from '../../../hooks';
import { UserService } from '../../../apiService';
import { SearchQuery, SearchResponse } from '../../../type';

const cx = classNames.bind(styles);

const Search = ({
    query,
    setQuery,
    setSearchResult,
}: {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setSearchResult: React.Dispatch<React.SetStateAction<SearchResponse>>;
}) => {
    const [loading, setLoading] = useState(false);

    // const [query, setQuery] = useState<string>('');
    const [result, setResult] = useState([]);
    const debouncedValue = useDebounce({ value: query, delay: 500 });

    useEffect(() => {
        if (!debouncedValue.trim()) {
            setResult([]);
            setSearchResult({ tinyUser: null, messages: null });
            return;
        }
        const handleSearchRequest = async () => {
            console.log('Search api running!');
            setLoading(true);
            const searchRequest: SearchQuery = { query: debouncedValue, offset: 0, limit: 10 };
            const response = await UserService.search(searchRequest);
            if (response) {
                if (response.data) {
                    const { user_aim, messages } = response.data;
                    console.log(user_aim);
                    console.log(messages);
                    setSearchResult({ tinyUser: user_aim, messages: messages });
                }
            }
            setLoading(false);
        };

        handleSearchRequest();
    }, [debouncedValue]);

    return (
        <div className={cx('search')}>
            <input
                value={query}
                onChange={(e) => {
                    if (e.target.value == '') setSearchResult({ tinyUser: null, messages: null });
                    setQuery(e.target.value);
                }}
                placeholder={i18n.t('HEADER_search_placeholder')}
                spellCheck={false}
            />
            {result.length > 0 && !loading && (
                <button className={cx('clear')}>
                    <FontAwesomeIcon icon={faCircleXmark} />
                </button>
            )}
            {loading && <FontAwesomeIcon className={cx('loading')} icon={faSpinner} />}
        </div>
    );
};

export default Search;
