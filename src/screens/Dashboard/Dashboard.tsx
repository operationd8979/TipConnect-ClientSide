import React, { useEffect } from 'react';
import styles from './Dashboard.module.scss';
import className from 'classnames/bind';
import {
    DowloadIcon,
    DownArrowIcon,
    EyeIcon,
    LiveIcon,
    StarIcon,
    UpArrowIcon,
    UploadIcon,
    UserIcon,
    EditIcon,
    DeleteIcon,
} from '../../components/Icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';
import images from '../../assets/images';
import { Movie, State, StreamingState } from '../../type';
import config from '../../config';
import { useDispatch, useSelector } from 'react-redux';
import MovieService from '../../apiService/MovieService';
import { addMovies } from '../../reducers';
import MovieCard from '../../components/MovieCard';

const cx = className.bind(styles);

export default function Dashboard() {
    const dispatch = useDispatch();
    const currentMovie = useSelector<any>((state) => state.MovieReducer) as StreamingState;
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { movies } = currentMovie;
    const { isLoggedIn } = currentUser;

    useEffect(() => {
        const callApiGetMovie = async () => {
            const res = await MovieService.getMovies('', 'down', '', 0);
            if (res) {
                if (res.ok) {
                    res.json().then((data) => {
                        dispatch(addMovies(data));
                    });
                }
            }
        };
        if (isLoggedIn) {
            if (movies.length === 0) {
                callApiGetMovie();
            }
        }
    }, [isLoggedIn]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('row')}>
                <div className={cx('wrapper-left')}>
                    <h1>Channel Dashboard</h1>
                    <div className={cx('section-2', 'jus-sb')}>
                        <div className={cx('card-wrapper')}>
                            <div className={cx('line')}>
                                <p>Views</p>
                                <div className={cx('icon', 'bg-red')}>
                                    <EyeIcon />
                                </div>
                            </div>
                            <div className={cx('line', 'hight-light')}>
                                <p>-10K</p>
                                <span>
                                    <DownArrowIcon height="1.5rem" fill="#dd0101" />
                                    10%
                                </span>
                            </div>
                        </div>

                        <div className={cx('card-wrapper')}>
                            <div className={cx('line')}>
                                <p>Rated this app</p>
                                <div className={cx('icon', 'bg-orange')}>
                                    <StarIcon />
                                </div>
                            </div>
                            <div className={cx('line', 'hight-light')}>
                                <p>-12K</p>
                                <span>
                                    <DownArrowIcon height="1.5rem" fill="rgb(237, 71, 0)" />
                                    -8%
                                </span>
                            </div>
                        </div>
                        <div className={cx('card-wrapper')}>
                            <div className={cx('line')}>
                                <p>Dowloaded</p>
                                <div className={cx('icon', 'bg-green')}>
                                    <DowloadIcon width="1.5rem" height="1.5rem" />
                                </div>
                            </div>
                            <div className={cx('line', 'hight-light')}>
                                <p>+22K</p>
                                <span>
                                    <UpArrowIcon height="1.5rem" fill="#00c30d" />
                                    29%
                                </span>
                            </div>
                        </div>
                        <div className={cx('card-wrapper')}>
                            <div className={cx('line')}>
                                <p>Visitors</p>
                                <div className={cx('icon', 'bg-yellow')}>
                                    <UserIcon />
                                </div>
                            </div>
                            <div className={cx('line', 'hight-light')}>
                                <p>+2M</p>
                                <span>
                                    <UpArrowIcon height="1.5rem" fill="rgb(219, 190, 0)" />
                                    20%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={cx('section-2')}>
                        <div className={cx('slide-wrapper')}>
                            <h2>Top Rated Item</h2>
                            <Swiper
                                slidesPerView={5}
                                spaceBetween={30}
                                freeMode={true}
                                pagination={{
                                    clickable: true,
                                }}
                                autoplay={{ delay: 2000, disableOnInteraction: false }}
                                modules={[Autoplay, FreeMode, Pagination]}
                                className={cx('movie_swiper')}
                            >
                                {movies &&
                                    movies.map((movie) => (
                                        <SwiperSlide key={movie.id} className={cx('movie_card')}>
                                            <MovieCard movie={movie} />
                                            <div className={cx('flex-cen', 'm1')}>
                                                <EyeIcon />
                                                <span>{movie.viewer}</span>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
                <div className={cx('wrapper-right')}>
                    {/* <Link className={cx('button')} to={config.routes.uploadMovie}>
                        <UploadIcon width="3rem" height="3rem" />
                    </Link>
                    <div className={cx('button')}>
                        <LiveIcon width="3rem" height="3rem" />
                    </div> */}
                </div>
            </div>
            <div className={cx('row')}>
                <div className={cx('section-1')}>
                    <h2>Recently Viewed Items</h2>
                    <div className={cx('table')}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Genre</th>
                                    <th>Description</th>
                                    <th>Create Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movies &&
                                    movies.map((movie) => (
                                        <tr key={movie.id}>
                                            <td>{movie.id}</td>
                                            <td>
                                                {movie.name.length > 20
                                                    ? `${movie.info.substring(0, 20)}...`
                                                    : movie.name}
                                            </td>
                                            <td>{movie.genre}</td>
                                            <td>
                                                {movie.info.length > 40
                                                    ? `${movie.info.substring(0, 40)}...`
                                                    : movie.info}
                                            </td>
                                            <td>{movie.year}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
