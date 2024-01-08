import React, { useEffect } from 'react';
import styles from './TopBar.module.scss';
import className from 'classnames/bind';
import { Link } from 'react-router-dom';
import config from '../../config';
import MovieService from '../../apiService/MovieService';
import { useDispatch, useSelector } from 'react-redux';
import { Genre, StreamingState } from '../../type';
import { getGenres } from '../../reducers';
const cx = className.bind(styles);

type TopBarProps = {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    genre: string;
    setGenre: React.Dispatch<React.SetStateAction<string>>;
};

export default function TopBar({ query, setQuery, genre, setGenre }: TopBarProps) {
    const currentStreaming = useSelector<any>((state) => state.MovieReducer) as StreamingState;
    const { genres } = currentStreaming;

    const dispatch = useDispatch();

    useEffect(() => {
        const callApiGetGenres = async () => {
            const response = await MovieService.getGenres();
            if (response) {
                if (response.ok) {
                    response.json().then((data) => {
                        console.log(data);
                        dispatch(getGenres(data));
                    });
                }
            }
        };
        if (genres.length === 0) callApiGetGenres();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <ul>
                <li className={cx('list', 'link')}>
                    <p>Thể loại</p>
                    <div className={cx('list-content')}>
                        {genres.map((g) => {
                            return (
                                <button
                                    key={g.genreId}
                                    className={cx('genre-item')}
                                    onClick={() => {
                                        setGenre(genre === g.genreName ? '' : g.genreName);
                                    }}
                                >
                                    <p>{g.genreName}</p>
                                </button>
                            );
                        })}
                    </div>
                </li>
                <li>
                    <button className={cx('link')} onClick={() => setGenre('')}>
                        Phim mới
                    </button>
                </li>
                <li>
                    <button className={cx('link')} onClick={() => setGenre('phim chiếu rạp')}>
                        Phim chiếu rạp
                    </button>
                </li>
                <li>
                    <button className={cx('link')}>Phát trực tiếp</button>
                </li>
                <li className={cx('search')}>
                    <input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                    />
                </li>
            </ul>
        </div>
    );
}
