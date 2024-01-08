import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Styles from './Home.module.scss';
import { UserService } from '../../apiService';
import { addHotMovies, addMovies, addTrendingMovies, getGifItems } from '../../reducers';

import { Movie, State, StreamingState, User } from '../../type';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import config from '../../config';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';
import TopBar from '../../components/TopBar';
import MovieCard from '../../components/MovieCard';
import SideBar from '../../components/SideBar';
import MovieService from '../../apiService/MovieService';

const cx = classNames.bind(Styles);

const Home = () => {
    const dispatch = useDispatch();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentMovie = useSelector<any>((state) => state.MovieReducer) as StreamingState;
    const { isLoggedIn, user, listRelationShip, listGifItem, i18n } = currentUser;
    const { movies, hotMovies, trendingMovies, genres } = currentMovie;

    const [query, setQuery] = useState('');
    const [genre, setGenre] = useState('');

    // const itemsPerPage = 20;
    // const [currentItems, setCurrentItems] = useState(movies.slice(0, 0 + itemsPerPage));
    // const totalPage = (movies.length - (movies.length % itemsPerPage)) / itemsPerPage;
    // const [currentPage, setCurrentPage] = useState(1);

    const showMovies = useCallback(() => {
        console.log(movies);
        const newShowMovies = movies.filter((movie) => {
            return movie.genre.includes(genre) && movie.name.toLowerCase().includes(query.toLowerCase());
        });
        return newShowMovies;
    }, [movies, query, genre]);

    // const changeIndex = async (index: number) => {
    //     setCurrentPage(index);
    //     const itemOffset = (index - 1) * itemsPerPage;
    //     console.log('item of set' + itemOffset);
    //     const endOffset = itemOffset + itemsPerPage;
    //     console.log('start' + itemOffset);
    //     console.log('end' + endOffset);
    //     setCurrentItems(showMovies().slice(itemOffset, endOffset));
    // };

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
        const callApiGetHotMovie = async () => {
            const res = await MovieService.getMovies('', 'down', '', 8);
            if (res) {
                if (res.ok) {
                    res.json().then((data) => {
                        dispatch(addHotMovies(data));
                    });
                }
            }
        };
        const callApiGetTrendingMovie = async () => {
            const res = await MovieService.getMovies('', 'down', 'down', 10);
            if (res) {
                if (res.ok) {
                    res.json().then((data) => {
                        dispatch(addTrendingMovies(data));
                    });
                }
            }
        };
        if (isLoggedIn) {
            if (movies.length === 0) {
                callApiGetMovie();
            }
            if (hotMovies.length === 0) {
                callApiGetHotMovie();
            }
            if (trendingMovies.length === 0) {
                callApiGetTrendingMovie();
            }
        }
    }, [isLoggedIn]);

    const getRandomMovieIndex = (maxIndex: number) => {
        return Math.floor(Math.random() * maxIndex);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('banner')}>
                {newMovies &&
                    newMovies.map((movie, index) => (
                        <div key={index} className={cx('details-container')}>
                            <div className={cx('title-info')}></div>
                            <h1>{movie.name}</h1>
                            <div className={cx('info-premiere')}>
                                <p>{movie.year}</p>
                                <p>{movie.duration}</p>
                                <p>{movie.genre}</p>
                            </div>
                            <div className={cx('title-info-summary')}>
                                <p>{movie.info}</p>
                            </div>
                            <div className={cx('btn-watch-now')}>
                                <Link
                                    to={
                                        movies.length > 0
                                            ? `/streaming/${movies[getRandomMovieIndex(movies.length)].id}`
                                            : ''
                                    }
                                >
                                    <p>Watch Now</p>
                                </Link>
                            </div>
                        </div>
                    ))}
                <div className={cx('overlay')}></div>
                <img src="https://altabel.files.wordpress.com/2016/11/1.jpg" alt="BACKGROUND" />
            </div>
            {isLoggedIn ? (
                <div className={cx('container')}>
                    <div className={cx('slide-container')}>
                        <h1>HOT MOVIES</h1>
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
                            {hotMovies &&
                                hotMovies.map((movie, index) => (
                                    <SwiperSlide key={index} className={cx('movie_card')}>
                                        <MovieCard movie={movie} />
                                    </SwiperSlide>
                                ))}
                        </Swiper>
                    </div>
                    <div className={cx('main-container')}>
                        <div className={cx('section-list-movie')}>
                            <h1>{genre ? genre : 'MORE LIKE THIS'}</h1>
                            <div className={cx('topbar')}>
                                <TopBar query={query} setQuery={setQuery} genre={genre} setGenre={setGenre} />
                            </div>
                            <div className={cx('link-container')}>
                                {showMovies().length > 0 &&
                                    showMovies().map((movie) => <MovieCard key={movie.id} movie={movie} />)}
                                {/* {
                                    <div className={cx('pagination-wraper')}>
                                        {currentPage > 2 && (
                                            <span onClick={() => changeIndex(1)} className={cx('pagination-bullet')}>
                                                1
                                            </span>
                                        )}
                                        {currentPage > 1 && (
                                            <span
                                                onClick={() => changeIndex(currentPage - 1)}
                                                className={cx('pagination-bullet')}
                                            >
                                                {currentPage - 1}
                                            </span>
                                        )}
                                        <span className={cx('pagination-bullet', 'pagination-bullet-active')}>
                                            {currentPage}
                                        </span>
                                        {currentPage < totalPage && (
                                            <span
                                                onClick={() => changeIndex(currentPage + 1)}
                                                className={cx('pagination-bullet')}
                                            >
                                                {currentPage + 1}
                                            </span>
                                        )}
                                        {currentPage + 1 < totalPage && (
                                            <span style={{ color: '#fff' }}>
                                                .....
                                                <span
                                                    onClick={() => changeIndex(totalPage)}
                                                    className={cx('pagination-bullet')}
                                                >
                                                    {totalPage}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                } */}
                            </div>
                        </div>
                        <div className={cx('side-bar')}>
                            <h1>Hot Trending</h1>
                            <SideBar url="" />
                        </div>
                    </div>
                </div>
            ) : (
                <div>Not login</div>
            )}
        </div>
    );
};

const newMovies: Movie[] = [
    {
        id: '1',
        name: 'The Shawshank Random Redemption',
        preview:
            'https://upload.wikimedia.org/wikipedia/vi/8/8c/%C4%90%E1%BA%A5t_r%E1%BB%ABng_ph%C6%B0%C6%A1ng_Nam_-_Official_poster.jpg',
        uri: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
        year: '2001',
        duration: 88,
        genre: 'Comedies',
        trailer: 'https://www.youtube.com/watch?v=YE7VzlLtp-4',
        rate: 1.5,
        viewer: '5',
        info: 'Let watch random movie, have fun with it and enjoy every moment',
        tbdmRating: '8.1',
        tbdmVote: '1.5k',
    },
];

export default Home;
