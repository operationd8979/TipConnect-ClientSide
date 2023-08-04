import { useState, ChangeEvent } from "react";
import axios from "axios";
import { equal } from "assert";
import { error } from "console";

const useRegister = () => {

    const [email, setEmail] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rePassword, setRePassword] = useState<string>('');

    const [emailError, setEmailError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [fristNameError, setFirstNameError] = useState('');
    const [passwrodError, setPasswordError] = useState('');
    const [rePasswordError, setRePasswordError] = useState('');

    const validateCredentials = () => {
        let result = true;
        setEmailError('');
        setLastNameError('');
        setFirstNameError('');
        setPasswordError('');
        setRePasswordError('');

        if (!email) {
            result = false;
        }
        if (!lastName) {
            result = false;
        }
        if (!firstName) {
            result = false;
        }
        if (!password) {
            result = false;
        }
        // if(rePassword){
        //     result = false;
        //     alert('rePassword');
        // }else if(rePassword === password){
        //     result = false;
        //     alert('rePassword2');
        // }

        return result;
    }

    const registerAction = async () => {
        if(validateCredentials()){
            const formData = {
                email: email,
                lastName: lastName,
                firstName: firstName,
                password: password,
            }
            try{
                const response = await axios.post('http://localhost:8080/api/v1/registration', formData);
                alert("Tạo tài khoản thành công, tokken: " + response.data);
            }catch(error){
                alert("Lỗi tạo tài khoản: " + error);
            }
        }
        else{
            alert('SomeThing wrong!');
        }
    }

    return {
        email,
        emailError,
        setEmail,
        lastName,
        lastNameError,
        setLastName,
        firstName,
        fristNameError,
        setFirstName,
        password,
        passwrodError,
        setPassword,
        rePassword,
        rePasswordError,
        setRePassword,
        registerAction,
    }
}

export default useRegister;