import Styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import { AuthenticationReponse, UpdateInfoRequest, State } from '../../type';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../apiService';
import { updateUserInfo, logout } from '../../reducers/userReducer/Action';
import Button from '../../components/Button';
import { CheckIcon } from '../../components/Icons';
import config from '../../config';
import routes from '../../config/routes';

const cx = classNames.bind(Styles);
const examplePassword = '';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const inputFile = useRef<HTMLInputElement>(null);
    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { isLoggedIn, user, listFriend } = currentUser;

    const [infoUser, setInfoUser] = useState<UpdateInfoRequest>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        newPassword: examplePassword,
        password: '',
    });
    const [rePassword, setRePassword] = useState('');

    // const [update, setUpdate] = useState(false);
    // const [password, setPassword] = useState('');

    const { firstName, lastName, newPassword, password } = infoUser;

    const update = useCallback(() => {
        return firstName !== user?.firstName || lastName !== user?.lastName || newPassword !== examplePassword;
    }, [firstName, lastName, newPassword]);

    useEffect(() => {
        console.log('init');
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            const getUserData = async () => {
                console.log('Call API get UserInfo');
                const response = await UserService.getUserInfo();
                if (response !== undefined) {
                    const data = response.data as AuthenticationReponse;
                    if (data.code === 200) {
                        const newUser = data.user;
                        if (JSON.stringify(user) !== JSON.stringify(newUser)) {
                            localStorage.setItem('currentUser', JSON.stringify(newUser));
                            dispatch(updateUserInfo(newUser));
                        }
                    }
                } else {
                    localStorage.removeItem('currentUser');
                    dispatch(logout());
                    navigate('/login');
                }
            };
            getUserData();
        }
    }, []);

    const handleUpdateInfo = async () => {
        const response = await UserService.updateUserInfo(infoUser);
        if (response !== undefined) {
            console.log(response);
            const data = response.data as AuthenticationReponse;
            if (data.code === 200) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                dispatch(updateUserInfo(data.user));
                window.location.reload();
            } else {
                alert(data.error_message);
            }
        } else {
            // localStorage.removeItem('currentUser');
            // dispatch(logout());
            // navigate('/login');
        }
    };

    const handleOpenFile = () => {
        inputFile?.current?.click();
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('sidebar')}>
                <div className={cx('user_avatar')}>
                    <img src={user?.urlAvatar} alt={user?.fullName} />
                </div>
                <div className={cx('user_name')}>
                    {firstName !== user?.firstName || lastName !== user.lastName
                        ? firstName + ' ' + lastName
                        : user.fullName}
                </div>
                <div className={cx('active_button_avatar')}>
                    <input
                        type="image_uploads"
                        id="image_uploads"
                        ref={inputFile}
                        style={{ display: 'none' }}
                        accept="image/png, image/jpeg"
                    />
                    <Button outline large onClick={() => handleOpenFile()}>
                        Change Avatar
                    </Button>
                </div>
            </div>
            <div className={cx('content')}>
                <div className={cx('header_content')}>Account Setting</div>
                <div className={cx('info_area')}>
                    <div className={cx('info_pack')}>
                        <div className={cx('lable')}>Email</div>
                        <div className={cx('input', 'disabled')}>
                            <input value={user?.email || ''} disabled={true}></input>
                            <div className={cx('old_property')}></div>
                        </div>
                    </div>
                    <div className={cx('info_pack')}>
                        <div className={cx('lable')}>First Name</div>
                        <div className={cx('input')}>
                            <input
                                value={firstName}
                                onChange={(e) => {
                                    setInfoUser({ ...infoUser, firstName: e.target.value });
                                }}
                                onBlur={() => {
                                    if (firstName === '') {
                                        setInfoUser({ ...infoUser, firstName: user?.firstName || '' });
                                    }
                                }}
                            ></input>
                            <div className={cx('old_property')}>
                                {firstName === user?.firstName ? '' : user?.firstName}
                            </div>
                        </div>
                    </div>
                    <div className={cx('info_pack')}>
                        <div className={cx('lable')}>Last Name</div>
                        <div className={cx('input')}>
                            <input
                                value={lastName}
                                onChange={(e) => {
                                    setInfoUser({ ...infoUser, lastName: e.target.value });
                                }}
                                onBlur={() => {
                                    if (lastName === '') {
                                        setInfoUser({ ...infoUser, lastName: user?.lastName || '' });
                                    }
                                }}
                            ></input>
                            <div className={cx('old_property')}>
                                {lastName === user?.lastName ? '' : user?.lastName}
                            </div>
                        </div>
                    </div>
                    <div className={cx('info_pack')}>
                        <div className={cx('lable')}>New Password</div>
                        <div className={cx('input', { change_password: newPassword !== examplePassword })}>
                            <input
                                value={newPassword}
                                type="password"
                                onChange={(e) => {
                                    setInfoUser({ ...infoUser, newPassword: e.target.value });
                                }}
                                onBlur={() => {
                                    if (newPassword === '') {
                                        setInfoUser({ ...infoUser, newPassword: examplePassword });
                                    }
                                }}
                            ></input>
                            {newPassword !== examplePassword && (
                                <div className={cx('old_property')}>
                                    Retype password:
                                    <input
                                        value={rePassword}
                                        type="password"
                                        onChange={(e) => {
                                            setRePassword(e.target.value);
                                        }}
                                    ></input>
                                    {newPassword === rePassword && newPassword != '' && (
                                        <div className={cx('icon_check')}>
                                            <CheckIcon></CheckIcon>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={cx('active_area')}>
                    {update() && (
                        <div className={cx('info_pack', 'flex_input')}>
                            <div className={cx('lable_password')}>Enter your password</div>
                            <div className={cx('input_password')}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setInfoUser({ ...infoUser, password: e.target.value });
                                    }}
                                ></input>
                            </div>
                        </div>
                    )}
                    <div className={cx('active_button')}>
                        <Button
                            warning={update()}
                            disabled={
                                !(
                                    update() &&
                                    password !== '' &&
                                    (newPassword === examplePassword || newPassword === rePassword)
                                )
                            }
                            outline={!update()}
                            large
                            onClick={() => handleUpdateInfo()}
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
