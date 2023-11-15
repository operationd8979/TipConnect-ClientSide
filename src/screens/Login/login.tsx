import classNames from 'classnames/bind';
import Styles from './Login.module.scss';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import { AuthenticationReponse, LoginRequest, State } from '../../type';
import Stomp, { Frame, VERSIONS, client, over, Client } from 'webstomp-client';
import { useEffect, useState } from 'react';
import { AuthService, SocketService } from '../../apiService';
import { loginSuccess, loginFail, connectSuccess, connectFail } from '../../reducers';
import { useDispatch, useSelector } from 'react-redux';
import i18n from '../../i18n/i18n';
import SockJS from 'sockjs-client';

const cx = classNames.bind(Styles);

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const currentStomp = useSelector<any>((state) => state.StompReducer) as Client;

    const { isLoggedIn, user, listFriend } = currentUser;

    const [loading, setLoading] = useState(false);

    const [loginRequest, setLoginRequest] = useState<LoginRequest>({
        email: 'operationddd@gmail.com',
        password: 'Mashiro1',
    });
    const { email, password } = loginRequest;

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
        if (currentStomp.connected) {
            SocketService.disconnectStomp(currentStomp);
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
                    const newStomp: Client = await SocketService.connectStomp(currentStomp, response.user.userID);
                    if (newStomp) {
                        dispatch(connectSuccess(newStomp));
                    } else {
                        dispatch(connectFail(currentStomp));
                    }
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
