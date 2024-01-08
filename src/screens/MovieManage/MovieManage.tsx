import React, { useEffect } from 'react';
import styles from './MovieManage.module.scss';
import className from 'classnames/bind';
import config from '../../config';
import { EditIcon, DeleteIcon } from '../../components/Icons';
import images from '../../assets/images';
import { Movie, State, StreamingState } from '../../type';
import { useDispatch, useSelector } from 'react-redux';
import { AdminService } from '../../apiService';
import { addUsers } from '../../reducers';
import MovieService from '../../apiService/MovieService';

const cx = className.bind(styles);
export default function MovieManage() {
    const dispatch = useDispatch();
    const currentMovie = useSelector<any>((state) => state.MovieReducer) as StreamingState;
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { movies } = currentMovie;
    const { isLoggedIn } = currentUser;

    useEffect(() => {
        const callApiGetUsers = async () => {
            const res = await MovieService.getMovies('', 'down', '', 0);
            if (res) {
                if (res.ok) {
                    res.json().then((data) => {
                        dispatch(addUsers(data));
                    });
                }
            }
        };
        if (isLoggedIn) {
            if (movies.length === 0) {
                callApiGetUsers();
            }
        }
    }, [isLoggedIn]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('wrapper-header')}>
                <h1>List Movie</h1>
            </div>
            <div className={cx('section-1')}>
                <div className={cx('wrapper-right')}>
                    <button>Add Movie</button>
                </div>
            </div>
            <div className={cx('section-2')}>
                <h2>Recently Viewed Items</h2>
                <div className={cx('table')}>
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>MOVIE</th>
                                <th>VIEWS</th>
                                <th>YEAR</th>
                                <th>TBDM Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies &&
                                movies.map((movie, index) => (
                                    <tr key={movie.id}>
                                        <td>{index}</td>
                                        <td className={cx('movie-box')}>
                                            <div className={cx('img-movie')}>
                                                <img src={movie.preview} alt="MOVIE_POSTER" />
                                            </div>
                                            <div className={cx('movie-info')}>
                                                <h4>{movie.name}</h4>
                                            </div>
                                        </td>
                                        <td>{movie.viewer}</td>
                                        <td>{movie.year}</td>
                                        <td>
                                            {movie.tbdmRating} /{movie.tbdmVote} votes
                                        </td>
                                        <td className={cx('movie-box')}>
                                            <div className={cx('btn-edit')}>
                                                <EditIcon />
                                            </div>
                                            <div className={cx('btn-delete')}>
                                                <DeleteIcon />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
