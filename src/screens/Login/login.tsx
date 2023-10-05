import classNames from 'classnames/bind';
import Styles from './Login.module.scss';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import { LoginRequest } from '../../type';
import { useState } from 'react';
import { post } from '../../utils/httpRequest';

const cx = classNames.bind(Styles);

const Login = () => {
    const navigate = useNavigate();

    const [loginRequest, setLoginRequest] = useState<LoginRequest>({
        email: '',
        password: '',
    });
    const { email, password } = loginRequest;

    const handleSubmit = async () => {
        if (email && password) {
            try {
                const reponse = await post({ path: 'v1/auth/login', options: loginRequest });
                if (reponse.data.code !== 200) {
                    alert(reponse.data.error_message);
                } else {
                    if (reponse.data.full_name) {
                        localStorage.setItem('fullName', reponse.data.full_name);
                        navigate('/');
                    } else {
                        alert('SomeThing wrong');
                    }
                }
            } catch (error) {
                alert(error);
            }
        } else {
            alert('Username and Password is required!!!');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content-side')}>
                <div className={cx('background-image')} />
                <div className={cx('header')}>Welcome</div>
                <div className={cx('title')}>Login to your Account</div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>Email</label>
                    <input
                        className={cx('input-text')}
                        placeholder="Username"
                        value={email}
                        onChange={(e) => {
                            setLoginRequest({
                                ...loginRequest,
                                email: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>Password</label>
                    <input
                        className={cx('input-text')}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            setLoginRequest({
                                ...loginRequest,
                                password: e.target.value,
                            });
                        }}
                    ></input>
                </div>
                <div className={cx('box-submit')}>
                    <Button large primary onClick={handleSubmit}>
                        Sign In
                    </Button>
                </div>
                <div className={cx('box-link')}>
                    <p className={cx('des')}>Don't have an account?</p>
                    <Link className={cx('link')} to={config.routes.register}>
                        CREATE NEW
                    </Link>
                </div>
            </div>
            <div className={cx('img-side')}></div>
        </div>
    );
};

export default Login;
