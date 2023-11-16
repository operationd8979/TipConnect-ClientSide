import Styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import { AuthenticationReponse, UpdateInfoRequest, State, UpdateAvatarRequest } from '../../type';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../apiService';
import {
    updateUserInfoSuccess,
    updateUserInfoFail,
    uploadAvatarSuccess,
    uploadAvatarFail,
} from '../../reducers/userReducer/Action';
import Button from '../../components/Button';
import { CheckIcon, UncheckIcon } from '../../components/Icons';
import config from '../../config';
import routes from '../../config/routes';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg, { blobUrlToFile } from '../../utils/imageUtil';
import Crop from '../../components/Crop';
import { uploadBytes, getDownloadURL, storageRef, storage } from '../../firebase';

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

    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [urlAvatar, setUrlAvatar] = useState<any>('');

    const [showCrop, setShowCrop] = useState(false);

    const { firstName, lastName, newPassword, password } = infoUser;

    const update = useCallback(() => {
        return firstName !== user?.firstName || lastName !== user?.lastName || newPassword !== examplePassword;
    }, [firstName, lastName, newPassword]);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            const getUserData = async () => {
                const response = await UserService.getUserInfo();
                if (response) {
                    const data = response.data as AuthenticationReponse;
                    if (data.code === 200) {
                        const newUser = data.user;
                        if (JSON.stringify(user) !== JSON.stringify(newUser)) {
                            localStorage.setItem('currentUser', JSON.stringify(newUser));
                            dispatch(updateUserInfoSuccess(newUser));
                        }
                    }
                } else {
                    dispatch(updateUserInfoFail());
                    navigate('/login');
                }
            };
            getUserData();
        }
    }, []);

    const handleUpdateInfo = async () => {
        const response = await UserService.updateUserInfo(infoUser);
        if (response) {
            const data = response.data as AuthenticationReponse;
            if (data.code === 200) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                dispatch(updateUserInfoSuccess(data.user));
                window.location.reload();
            } else {
                alert(data.error_message);
            }
        } else {
            dispatch(updateUserInfoFail());
            navigate('/login');
        }
    };

    const handleOpenFile = () => {
        inputFile?.current?.click();
    };

    useEffect(() => {
        return () => {
            urlAvatar && URL.revokeObjectURL(urlAvatar);
        };
    }, [urlAvatar]);

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file: File = event.target.files[0];
            setShowCrop(true);
            setUrlAvatar(URL.createObjectURL(file));
            event.target.value = '';
        }
    };

    const handleCropImage = async (previewUrl: string) => {
        const url = await uploadImage(previewUrl);
        if (url) {
            const request: UpdateAvatarRequest = {
                urlAvatar: url,
            };
            UserService.updateAvatar(request).then((response) => {
                if (response) {
                    const data = response.data as AuthenticationReponse;
                    if (data.code == 200) {
                        console.log(data.message);
                        dispatch(uploadAvatarSuccess(url));
                    } else {
                        console.log(data.error_message);
                    }
                } else {
                    dispatch(uploadAvatarFail());
                }
            });
        }
        setUrlAvatar(null);
        setShowCrop(false);
    };

    const uploadImage = async (previewUrl: string) => {
        try {
            const ref = storageRef(storage, `UserArea/${user?.email}/avatar/${user?.fullName}.jpeg`);
            const fileData = await fetch(previewUrl);
            const bytes = await fileData.blob();
            const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    const onCancel = () => {
        setShowCrop(false);
        setUrlAvatar(null);
    };

    return (
        <div className={cx('wrapper')}>
            {showCrop && <Crop urlAvatar={urlAvatar} handleCropImage={handleCropImage} onCancel={onCancel} />}
            <div className={cx('sidebar')}>
                {user?.urlAvatar && (
                    <div className={cx('user_avatar')}>
                        <img src={user.urlAvatar} alt={user?.fullName} />
                    </div>
                )}
                <div className={cx('user_name')}>
                    {firstName !== user?.firstName || lastName !== user.lastName
                        ? firstName + ' ' + lastName
                        : user.fullName}
                </div>
                <div className={cx('active_button_avatar')}>
                    <input
                        type="file"
                        id="image_uploads"
                        ref={inputFile}
                        style={{ display: 'none' }}
                        accept="image/png, image/jpeg"
                        onChange={(e) => onChangeFile(e)}
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
                                    <div className={cx('icon_check')}>
                                        {newPassword === rePassword && newPassword != '' ? (
                                            <CheckIcon></CheckIcon>
                                        ) : (
                                            <UncheckIcon></UncheckIcon>
                                        )}
                                    </div>
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
                                    (update() &&
                                        password !== '' &&
                                        (newPassword === examplePassword || newPassword === rePassword)) ||
                                    showCrop
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
