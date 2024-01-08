import React from 'react';
import styles from './SideBar.module.scss';
import { Link } from 'react-router-dom';
import className from 'classnames/bind';
import StarRate from '../StarRate';
import { Movie, StreamingState } from '../../type';
import { useSelector } from 'react-redux';

const cx = className.bind(styles);

export default function SideBar({ url }: { url: string }) {
    const currentMovie = useSelector<any>((state) => state.MovieReducer) as StreamingState;
    const trendingMovies: Movie[] = currentMovie.trendingMovies;

    return (
        <div className={cx('wrapper')}>
            <ul>
                {trendingMovies.map((movie) => (
                    <li className={cx('movie-section')} key={movie.id}>
                        <Link to={`${url}/${movie.id}`} className={cx('link')}>
                            <img src={movie.preview} alt="IMG-ITEM" />
                            <div className={cx('movie-info')}>
                                <p>{movie.name}</p>
                                <p className={cx('year')}>{movie.genre}</p>
                                <p className={cx('tbdm-rating')}>Tbdm: {movie.tbdmRating}</p>
                                <p className={cx('year')}>{movie.tbdmVote} votes</p>
                                <StarRate rate={Number(movie.tbdmRating) / 2} />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
