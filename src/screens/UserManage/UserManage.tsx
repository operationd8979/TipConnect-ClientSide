import React, { useEffect } from 'react';
import styles from './UserManage.module.scss';
import className from 'classnames/bind';
import config from '../../config';
import { EditIcon, DeleteIcon } from '../../components/Icons';
import images from '../../assets/images';
import { Movie, State, StreamingState } from '../../type';
import { useDispatch, useSelector } from 'react-redux';
import { AdminService } from '../../apiService';
import { addUsers } from '../../reducers';

const cx = className.bind(styles);
export default function UserManage() {
    const dispatch = useDispatch();
    const currentMovie = useSelector<any>((state) => state.MovieReducer) as StreamingState;
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { users } = currentMovie;
    const { isLoggedIn } = currentUser;

    useEffect(() => {
        const callApiGetUsers = async () => {
            const res = await AdminService.getAllUsers();
            if (res) {
                if (res.ok) {
                    res.json().then((data) => {
                        dispatch(addUsers(data));
                    });
                }
            }
        };
        if (isLoggedIn) {
            if (users.length === 0) {
                callApiGetUsers();
            }
        }
    }, [isLoggedIn]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('wrapper-header')}>
                <h1>List User</h1>
            </div>
            <div className={cx('section-1')}>
                <div className={cx('wrapper-right')}>
                    <button>Add Notication</button>
                </div>
            </div>
            <div className={cx('section-2')}>
                <h2>Recently Viewed Items</h2>
                <div className={cx('table')}>
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>USER</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users &&
                                users.map((user, index) => (
                                    <tr key={user.userID}>
                                        <td>{index}</td>
                                        <td className={cx('movie-box')}>
                                            <div className={cx('img-movie')}>
                                                <img src={user.urlAvatar} alt="AVATAR_USER" />
                                            </div>
                                            <div className={cx('movie-info')}>
                                                <h4>
                                                    {user.fullName.length > 30
                                                        ? `${user.fullName.substring(0, 30)}...`
                                                        : user.fullName}
                                                </h4>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
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
