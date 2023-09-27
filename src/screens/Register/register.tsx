import classNames from 'classnames/bind';
import Styles from './Register.module.scss';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import config from '../../config';
import { RegisterRequest } from '../../type';
import { useState } from 'react';
import { post } from '../../utils/httpRequest';

const cx = classNames.bind(Styles);

const Register = () => {
    const [registerRequest, setRegisterRequest] = useState<RegisterRequest>({
        email: '',
        fristName: '',
        lastName: '',
        password: '',
    });
    const [rePassword, setRePassword] = useState<string>('');
    const { email, fristName, lastName, password } = registerRequest;

    const handleSubmit = async () => {
        if (email && fristName && lastName && password) {
            if (password === rePassword) {
                try {
                    const reponse = await post({ path: 'v1/registration', options: registerRequest });
                    alert(reponse.data);
                } catch (error) {
                    alert(error);
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
                        value={fristName}
                        onChange={(e) => {
                            setRegisterRequest({
                                ...registerRequest,
                                fristName: e.target.value,
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
                        placeholder="Password"
                        value={password}
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
                        placeholder="Re-type Password"
                        value={rePassword}
                        onChange={(e) => {
                            setRePassword(e.target.value);
                        }}
                    ></input>
                </div>
                <div className={cx('box-submit')}>
                    <Button large primary onClick={handleSubmit}>
                        Register
                    </Button>
                </div>
                <div className={cx('box-link')}>
                    <p className={cx('des')}>Already have an account!</p>
                    <Link className={cx('link')} to={config.routes.login}>
                        Login in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
