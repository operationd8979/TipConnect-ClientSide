import classNames from 'classnames/bind';
import Styles from './Register.module.scss';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import { RegisterRequest, AuthenticationReponse } from '../../type';
import { useState } from 'react';
import { post } from '../../utils/httpRequest';
import { AuthService } from '../../apiService';
import { registerSuccess, registerFail } from '../../reducers/userReducer/Action';
import { useDispatch } from 'react-redux';

const cx = classNames.bind(Styles);

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [registerRequest, setRegisterRequest] = useState<RegisterRequest>({
        email: 'operationddd@gmail.com',
        firstName: 'Dung',
        lastName: 'Vo',
        password: 'Mashiro1',
    });
    const [rePassword, setRePassword] = useState<string>('Mashiro1');
    const { email, firstName, lastName, password } = registerRequest;

    const handleSubmit = async () => {
        if (email && firstName && lastName && password) {
            if (password === rePassword) {
                const response = (await AuthService.Register(registerRequest)) as AuthenticationReponse;
                if (response != undefined) {
                    if (response.code == 200) {
                        //localStorage.setItem('currentUser', JSON.stringify(reponse.user));
                        dispatch(registerSuccess(response.user));
                        navigate('/');
                    } else {
                        alert(response.error_message);
                        dispatch(registerFail());
                    }
                }
            } else {
                alert('retype');
            }
        } else {
            alert('Input');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('img-side')}></div>
            <div className={cx('content-side')}>
                <div className={cx('background-image')} />
                <div className={cx('header')}>Welcome</div>
                <div className={cx('title')}>Create an account</div>
                <div className={cx('box-input')}>
                    <label className={cx('lable')}>Email</label>
                    <input
                        className={cx('input-text')}
                        placeholder="Email"
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
                    <label className={cx('lable')}>FristName</label>
                    <input
                        className={cx('input-text')}
                        placeholder="Fristname"
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
                    <label className={cx('lable')}>LastName</label>
                    <input
                        className={cx('input-text')}
                        placeholder="Lastname"
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
                    <label className={cx('lable')}>Password</label>
                    <input
                        className={cx('input-text')}
                        type="password"
                        placeholder="Password"
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
                    <label className={cx('lable')}>Rety-Password</label>
                    <input
                        className={cx('input-text')}
                        type="password"
                        placeholder="Re-type Password"
                        value={rePassword}
                        disabled={loading}
                        onChange={(e) => {
                            setRePassword(e.target.value);
                        }}
                    ></input>
                </div>
                <div className={cx('box-submit')}>
                    <Button large primary onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Loading...' : 'Register'}
                    </Button>
                </div>
                <div className={cx('box-link')}>
                    <p className={cx('des')}>Already have an account!</p>
                    <Link className={cx('link')} to={loading ? '#' : config.routes.login}>
                        Login in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
