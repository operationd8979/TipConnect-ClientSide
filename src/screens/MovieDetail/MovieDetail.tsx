import { useEffect, useState } from 'react';
import styles from './MovieDetail.module.scss';
import className from 'classnames/bind';
import { Movie } from '../../type';
import images from '../../assets/images';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RightChevronIcon } from '../../components/Icons';
import StarRate from '../../components/StarRate';
import SideBar from '../../components/SideBar';
import RouterBar from '../../components/RouterBar';
import MovieService from '../../apiService/MovieService';
import TopBar from '../../components/TopBar';

const cx = className.bind(styles);

const MovieDetail = () => {
    const { id } = useParams();
    const [thisMovie, setThisMovie] = useState<Movie | null>(null);
    useEffect(() => {
        window.scrollTo(0, 0);
        const callGetApiDetailMovie = async () => {
            const response = await MovieService.getDetailMovie(id || '1234');
            if (response) {
                const data = response.data;
                console.log(data);
                if (data) {
                    setThisMovie(data);
                }
            }
        };
        callGetApiDetailMovie();
    }, [id]);
    return thisMovie ? (
        <div className={cx('wrapper')}>
            <div className={cx('topbar')}></div>
            <div className={cx('routing-bar')}>
                <RouterBar parent="Trang chủ" children1={thisMovie.genre} endpoint={thisMovie.name} />
            </div>
            <div className={cx('wrapper-container')}>
                <div className={cx('wrapper-left')}>
                    <div className={cx('movie-section')}>
                        <div className={cx('left')}>
                            <img src={thisMovie.preview} alt="MOVIE-POSTER" />
                            <div className={cx('watch-button')}>
                                <Link to={`/streaming/${thisMovie.id}`}>
                                    <p>Watch</p>
                                    <RightChevronIcon />
                                </Link>
                            </div>
                        </div>
                        <div className={cx('right')}>
                            <div className={cx('title')}>
                                <h1>{thisMovie.name}</h1>
                            </div>

                            <div className={cx('section')}>
                                <p className={cx('lable')}>Lượt xem: </p>
                                <p>{thisMovie.viewer}</p>
                            </div>
                            <div className={cx('section')}>
                                <p className={cx('lable')}>Thể loại: </p>
                                <p>{thisMovie.genre}</p>
                            </div>
                            <div className={cx('section')}>
                                <p className={cx('lable')}>Năm sản xuất:</p>
                                <p>{thisMovie.year}</p>
                            </div>
                            <div className={cx('section')}>
                                <p className={cx('lable')}>TbdmRating:</p>
                                <p>{thisMovie.tbdmRating}</p>
                            </div>
                            <div className={cx('section')}>
                                <p className={cx('lable')}>TbdmVote:</p>
                                <p>{thisMovie.tbdmVote}</p>
                            </div>
                            <div className={cx('section')}>
                                <p className={cx('lable')}>Thời lượng:</p>
                                <p>{thisMovie.duration} phút</p>
                            </div>
                            <div className={cx('section')}>
                                <p className={cx('lable')}>Đánh giá: </p>
                                <StarRate rate={Number(thisMovie.tbdmRating) / 2} />
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold' }}>Nội dung: </span>
                                <span>{thisMovie.info}</span>
                            </div>
                            <div className={cx('section', 'video-trailer')}>
                                <p className={cx('lable')}>Trailer: </p>
                                <video
                                    className={cx('video')}
                                    src={`http://localhost:8080/api/streaming/watch/${id}`}
                                    controls
                                    autoPlay
                                    muted
                                ></video>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cx('wrapper-right')}>
                    <SideBar url="" />
                </div>
            </div>
        </div>
    ) : (
        <div className={cx('wrapper')}></div>
    );
};

export default MovieDetail;
