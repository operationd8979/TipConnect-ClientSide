import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import i18n from '../../../i18n/i18n';
import { useDebounce } from '../../../hooks';
import { UserService } from '../../../apiService';
import { SearchQuery, SearchResponse } from '../../../type';
import { UncheckIcon, Spinner } from '../../../components/Icons';

const cx = classNames.bind(styles);

let currentOffset = 0;

const Search = ({
    query,
    setQuery,
    searchResult,
    setSearchResult,
    triggerLoadMore,
    setShowLoadMore,
}: {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    searchResult: SearchResponse;
    setSearchResult: React.Dispatch<React.SetStateAction<SearchResponse>>;
    triggerLoadMore: boolean;
    setShowLoadMore: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(false);
    const debouncedValue = useDebounce({ value: query, delay: 500 });

    useEffect(() => {
        if (!debouncedValue.trim()) {
            setResult(false);
            currentOffset = 0;
            setSearchResult({ tinyUser: null, messages: [] });
            setShowLoadMore(false);
            return;
        }
        const handleSearchRequest = async () => {
            setLoading(true);
            const searchRequest: SearchQuery = { query: debouncedValue, offset: currentOffset, limit: 10 };
            const response = await UserService.search(searchRequest);
            if (response?.ok) {
                response.json().then((data) => {
                    const partOne = data[0];
                    const partTwo = data[1];
                    const { user_aim, offset } = partOne;
                    if (currentOffset === 0) {
                        currentOffset = offset;
                        setSearchResult({ tinyUser: user_aim, messages: partTwo });
                    } else {
                        currentOffset = offset;
                        setSearchResult({
                            tinyUser: searchResult.tinyUser,
                            messages: [...searchResult.messages, ...partTwo],
                        });
                    }
                    if (offset === 0) {
                        currentOffset = 0;
                        setShowLoadMore(false);
                    } else setShowLoadMore(true);

                    if (user_aim) {
                        setResult(true);
                    }
                });
            }
            setLoading(false);
        };
        handleSearchRequest();
    }, [debouncedValue, triggerLoadMore]);

    const handleClearResult = () => {
        setResult(false);
        setQuery('');
        setSearchResult({ tinyUser: null, messages: [] });
    };

    return (
        <div className={cx('search')}>
            <input
                value={query}
                onChange={(e) => {
                    if (e.target.value == '') setSearchResult({ tinyUser: null, messages: [] });
                    setQuery(e.target.value);
                    currentOffset = 0;
                }}
                placeholder={i18n.t('HEADER_search_placeholder')}
                spellCheck={false}
            />
            {result && !loading && (
                <button className={cx('clear')} onClick={handleClearResult}>
                    <UncheckIcon />
                </button>
            )}
            {loading && (
                <div className={cx('loading')}>
                    <Spinner />
                </div>
            )}
        </div>
    );
};

export default Search;
