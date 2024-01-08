import { useEffect, useState } from 'react';
import className from 'classnames/bind';
import styles from './WatchMovie.module.scss';
import { useParams } from 'react-router-dom';
import { Movie } from '../../type';
import images from '../../assets/images';
import TopBar from '../../components/TopBar';
import RouterBar from '../../components/RouterBar';
import StarRate from '../../components/StarRate';
import SideBar from '../../components/SideBar';
import MovieService from '../../apiService/MovieService';
import CommentSection from '../../components/CommentSection';

const cx = className.bind(styles);
function WatchMovie() {
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
            <div className={cx('video-wrapper')}>
                <video src={`http://localhost:8080/api/streaming/watch/${id}`} controls autoPlay muted></video>
            </div>
            <div className={cx('section-movie')}>
                <h1 className={cx('name-movie')}>{thisMovie.name}</h1>
                <p>Lượt xem: {thisMovie.viewer}</p>
                <StarRate rate={Number(thisMovie.tbdmRating) / 2} />
                <div className={cx('info-wrapper')}>
                    <p>{thisMovie.info}</p>
                </div>
            </div>
            <div className={cx('section-comment')}>
                <h1>Bình luận</h1>
                <div className={cx('row')}>
                    <div className={cx('left')}>
                        <CommentSection id={thisMovie.id} />
                    </div>
                    <div className={cx('right')}>
                        <SideBar url="" />
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className={cx('wrapper')}></div>
    );
}

export default WatchMovie;
