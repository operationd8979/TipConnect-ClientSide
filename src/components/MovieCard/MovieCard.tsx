import React from 'react';
import styles from './MovieCard.module.scss';
import { Link } from 'react-router-dom';
import className from 'classnames/bind';
import { Movie } from '../../type';

const cx = className.bind(styles);

function MovieCard({ movie }: { movie: Movie }) {
    return (
        <Link to={`/${movie.id}`} className={cx('wrapper')}>
            <div className={cx('poster')}>
                <img src={movie.preview} alt="MOVIE_POSTER" />
            </div>
            <p>{movie.name}</p>
        </Link>
    );
}

export default MovieCard;
