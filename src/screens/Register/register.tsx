import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import Styles from './Register.module.scss';

import Button from '../../components/Button';
import config from '../../config';
import { Client } from 'webstomp-client';
import { AuthService, SocketService } from '../../apiService';
import { registerSuccess, registerFail } from '../../reducers';
import { RegisterRequest, AuthenticationReponse, State } from '../../type';

const cx = classNames.bind(Styles);

const Register = () => {
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { socket, stompClient } = currentStomp;
    const { isLoggedIn, i18n } = currentUser;

    const [registerRequest, setRegisterRequest] = useState<RegisterRequest>({
        email: 'operationddd@gmail.com',
        firstName: 'Vo',
        lastName: 'Hoang Dung',
        password: 'Mashiro1',
    });
    const [rePassword, setRePassword] = useState<string>('Mashiro1');
    const { email, firstName, lastName, password } = registerRequest;

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
        if (stompClient.connected) {
            SocketService.disconnectStomp(stompClient);
        }
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        if (email && firstName && lastName && password) {
            if (password === rePassword) {
                const response = (await AuthService.Register(registerRequest)) as AuthenticationReponse;
                if (response) {
                    if (response.code === 200) {
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        dispatch(registerSuccess(response.user));
                        navigate('/');
                    } else {
                        alert(response.error_message);
                        dispatch(registerFail());
                    }
                }
            } else {
                alert(i18n.t('WARRING_WRONG_RETYPE_PASSWORD'));
            }
        } else {
            alert(i18n.t('WARRING_REQUIRE_VALUE'));
        }
        setLoading(false);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('img-side')}></div>
            <div className={cx('content-side')}>
                <div className={cx('background-image')} />
                <div className={cx('header')}>{i18n.t('REGISTER_welcome')}</div>
                <div className={cx('title')}>{i18n.t('REGISTER_welcome_des')}</div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_email')}</label>
                    <input
                        className={cx('input-text')}
                        placeholder={i18n.t('FINAL_email')}
                        value={email}
                        disabled={loading}
                        onChange={(e) => {
                            setRegisterRequest({
                                ...registerRequest,
                                email: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_fristName')}</label>
                    <input
                        className={cx('input-text')}
                        placeholder={i18n.t('FINAL_fristName')}
                        value={firstName}
                        disabled={loading}
                        onChange={(e) => {
                            setRegisterRequest({
                                ...registerRequest,
                                firstName: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_lastName')}</label>
                    <input
                        className={cx('input-text')}
                        placeholder={i18n.t('FINAL_lastName')}
                        value={lastName}
                        disabled={loading}
                        onChange={(e) => {
                            setRegisterRequest({
                                ...registerRequest,
                                lastName: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_password')}</label>
                    <input
                        className={cx('input-text')}
                        type="password"
                        placeholder={i18n.t('FINAL_password')}
                        value={password}
                        disabled={loading}
                        onChange={(e) => {
                            setRegisterRequest({
                                ...registerRequest,
                                password: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_passwordRe')}</label>
                    <input
                        className={cx('input-text')}
                        type="password"
                        placeholder={i18n.t('FINAL_passwordRe')}
                        value={rePassword}
                        disabled={loading}
                        onChange={(e) => {
                            setRePassword(e.target.value);
                        }}
                    ></input>
                </div>
                <div className={cx('box-submit')}>
                    <Button large primary onClick={handleSubmit} disabled={loading}>
                        {loading ? i18n.t('FINAL_loading') : i18n.t('REGISTER_REGISTER')}
                    </Button>
                </div>
                <div className={cx('box-link')}>
                    <p className={cx('des')}>{i18n.t('REGISTER_login_des')}</p>
                    <Link className={cx('link')} to={loading ? '#' : config.routes.login}>
                        {i18n.t('REGISTER_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
