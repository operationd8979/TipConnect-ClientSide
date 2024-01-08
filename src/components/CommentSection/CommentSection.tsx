import React from 'react';
import styles from './CommentSection.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);
export default function CommentSection({ id }: { id: string }) {
    return (
        <div className={cx('wrapper')}>
            <div>
                <div className={cx('wrapper-header')}>
                    <div className={cx('wrapper-left')}>
                        <span>{listComment.length}</span>
                        <span> bình luận</span>
                    </div>
                    <div className={cx('wrapper-right')}>
                        <label htmlFor="comment-select">Sắp xếp theo </label>
                        <select id="comment-select">
                            <option value="option1">Mới nhất</option>
                            <option value="option2">Cũ nhất</option>
                        </select>
                    </div>
                </div>
                <div className={cx('content')}>
                    {listComment.map((comment, index) => (
                        <div className={cx('comment-section')} key={index}>
                            <div className={cx('avatar')}>
                                <img src={comment.imgUri} alt="" />
                            </div>
                            <div>
                                <p className={cx('cmt-name')}>{comment.username}</p>
                                <p className={cx('cmt-content')}>{comment.content}</p>
                                <p className={cx('cmt-day')}>{comment.createDay}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const listComment = [
    {
        username: 'Nguyễn Ngọc An Nhiên',
        imgUri: 'https://scontent.fsgn4-1.fna.fbcdn.net/v/t39.30808-1/405314106_1986172438421783_8036003948239311866_n.jpg?stp=cp0_dst-jpg_p74x74&_nc_cat=103&ccb=1-7&_nc_sid=4da83f&_nc_eui2=AeE_AtB26IV5VZw0PY8KM_iqlDaR7QyklimUNpHtDKSWKUtUHmhBGe_QgOHDcXHZ--vQDHyl1CbRJPQZKEGD6I0R&_nc_ohc=z8jH-W0KEHQAX-e4ISo&_nc_ht=scontent.fsgn4-1.fna&edm=ADI6gjAEAAAA&oh=00_AfDdMZQNzLoKJDEDUaRS5sw9hfjRHGGqch4cKyhk_CEUlw&oe=65999C6D',
        content: 'tự nhiên T xem YS với HD giận nhau t khóc ngang :(',
        createDay: '2 giờ',
    },
    {
        username: 'Đồng Hoa',
        imgUri: 'https://scontent.fsgn13-2.fna.fbcdn.net/v/t39.30808-1/244582922_1791960847672651_6407607843482373068_n.jpg?stp=cp0_dst-jpg_p74x74&_nc_cat=109&ccb=1-7&_nc_sid=4da83f&_nc_eui2=AeGqsCFsZAhHOO0qRrbOkA8RthBqf7Y3Ehu2EGp_tjcSG58a23pqSZW6BMzdKBIwsyNG8YzvAMZ-Z2bIt51XmEjb&_nc_ohc=Ry6rLsTJlR8AX8BM9SN&_nc_ht=scontent.fsgn13-2.fna&edm=ADI6gjAEAAAA&oh=00_AfDi1b0-9jUT-ZRJ4njPn-im0hSEUx1HByoLNdJnqtGZ7g&oe=6598FF1A',
        content: 'Xem 4 đứa nó giận hờn, đuổi bóng mà người mệt là tui. Ngược làm đau tim quá',
        createDay: '11 giờ',
    },
    {
        username: 'Hourr Hour',
        imgUri: 'https://scontent.fsgn8-2.fna.fbcdn.net/v/t39.30808-1/410692526_1055461598937183_4088396672134249063_n.jpg?stp=c19.0.74.74a_cp0_dst-jpg_p74x74&_nc_cat=100&ccb=1-7&_nc_sid=4da83f&_nc_eui2=AeG8kK17jdv9XQ_vKLMSI9ZlAywkO93yL0gDLCQ73fIvSLLyTMKLav7sF8JzRvsbrJYe345fIVNMJPZ6T-YgA3N5&_nc_ohc=09V28KCCEscAX_GLryk&_nc_ht=scontent.fsgn8-2.fna&edm=ADI6gjAEAAAA&oh=00_AfD6MRbk2274JPUAsUCKhCymkfVeaYB0eAeRnHs488fnCQ&oe=6599B3A5',
        content: '*LỊCH CHIẾU PHIM " THẦN ẨN " CHẶNG KẾT',
        createDay: '8 giờ',
    },
    {
        username: 'Nguyễn Ngọc Linh',
        imgUri: 'https://scontent.fsgn8-2.fna.fbcdn.net/v/t39.30808-1/412629731_1069358327587825_5548520948646087531_n.jpg?stp=cp6_dst-jpg_p74x74&_nc_cat=100&ccb=1-7&_nc_sid=4da83f&_nc_eui2=AeHQHiCRZRbsxuhdAHnxEFXliyn0Kud3l0OLKfQq53eXQ7a13iXVBs2FAxER-KLBhHUzdO4B2NgAfFXhZVAP06Q5&_nc_ohc=GFrP2wf1eIgAX8-7eau&_nc_oc=AQnlmYML9qk0ExIjnwSa79CPbyTyzaIltqSjh-OOjZtXq7-MmOKNjmlFvRQVS230MkihatUfc5UuvxJckJ4hGjUD&_nc_ht=scontent.fsgn8-2.fna&edm=ADI6gjAEAAAA&oh=00_AfAD4k6qi56jDVKl2-WHPFdpVShdmOEyl442tZagOBAYCA&oe=659A0D0B',
        content: 'tự nhiên T xem YS với HD giận nhau t khóc ngang :(',
        createDay: '2 giờ',
    },
];
