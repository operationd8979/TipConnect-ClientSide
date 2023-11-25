import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Client } from 'webstomp-client';
import classNames from 'classnames/bind';
import Styles from './Login.module.scss';

import Button from '../../components/Button';
import { AuthService, SocketService } from '../../apiService';
import { loginSuccess, loginFail } from '../../reducers';
import { AuthenticationReponse, LoginRequest, State } from '../../type';
import config from '../../config';
import i18n from '../../i18n/i18n';

const cx = classNames.bind(Styles);

const Login = () => {
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as { socket: WebSocket; stompClient: Client };
    const { isLoggedIn, user, listFriend } = currentUser;
    const { socket, stompClient } = currentStomp;

    const [loginRequest, setLoginRequest] = useState<LoginRequest>({
        email: 'operationddd@gmail.com',
        password: 'Mashiro1',
    });
    const { email, password } = loginRequest;

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
        if (email && password) {
            const response = (await AuthService.Login(loginRequest)) as AuthenticationReponse;
            if (response) {
                if (response.code == 200) {
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    dispatch(loginSuccess(response.user));
                    navigate('/');
                } else {
                    alert(response.error_message);
                    dispatch(loginFail());
                }
            }
        } else {
            alert('Username and Password is required!!!');
        }
        setLoading(false);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content-side')}>
                <div className={cx('background-image')} />
                <div className={cx('header')}>{i18n.t('LOGIN_welcome')}</div>
                <div className={cx('title')}>{i18n.t('LOGIN_welcome_des')}</div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_email')}</label>
                    <input
                        className={cx('input-text')}
                        placeholder={i18n.t('FINAL_email_phone')}
                        value={email}
                        disabled={loading}
                        onChange={(e) => {
                            setLoginRequest({
                                ...loginRequest,
                                email: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>{i18n.t('FINAL_password')}</label>
                    <input
                        className={cx('input-text')}
                        placeholder={i18n.t('FINAL_password')}
                        value={password}
                        disabled={loading}
                        type="password"
                        onChange={(e) => {
                            setLoginRequest({
                                ...loginRequest,
                                password: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-submit')}>
                    <Button large primary onClick={handleSubmit} disabled={loading}>
                        {loading ? i18n.t('FINAL_loading') : i18n.t('LOGIN_LOGIN')}
                    </Button>
                </div>
                <div className={cx('box-link')}>
                    <p className={cx('des')}>{i18n.t('LOGIN_register_des')}</p>
                    <Link className={cx('link')} to={loading ? '#' : config.routes.register}>
                        {i18n.t('LOGIN_register')}
                    </Link>
                </div>
            </div>
            <div className={cx('img-side')}></div>
        </div>
    );
};

export default Login;
