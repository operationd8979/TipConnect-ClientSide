import { LoginRequest, RegisterRequest } from '../../type';
import { post } from '../../utils/httpRequest';

const Login = async (loginRequest: LoginRequest) => {
    try {
        const respone = await post({ path: 'v1/auth/login', options: loginRequest });
        return respone.data;
    } catch (error) {
        alert(error);
    }
};

const Register = async (registerRequest: RegisterRequest) => {
    try {
        const respone = await post({ path: 'v1/registration', options: registerRequest });
        return respone.data;
    } catch (error) {
        alert(error);
    }
};

const Logout = () => {};

export default { Login, Register, Logout };
