import { useState } from "react";
import axios from "axios";
import { equal } from "assert";
import { error } from "console";

const useRegister = () =>{

    const [email,setEmail] = useState<string>('');
    const [lastName,setLastName] = useState<string>('');
    const [firstName,setFirstName] = useState<string>('');
    const [password,setPassword] = useState<string>('');
    const [rePassword,setRePassword] = useState<string>('');

    const [emailError,setEmailError] = useState('');
    const [lastNameError,setLastNameError] = useState('');
    const [fristNameError,setFirstNameError] = useState('');
    const [passwrodError,setPasswordError] = useState('');
    const [rePasswordError,setRePasswordError] = useState('');

    const validateCredentials = () => {
        let result = true;
        setEmailError('');
        setLastNameError('');
        setFirstNameError('');
        setPasswordError('');
        setRePasswordError('');

        if(!email){
            result = false;
            alert('email');
        }
        if(!lastName){
            result = false;
            alert('lastName');
        }
        if(!firstName){
            result = false;
            alert('firstName');
        }
        if(!password){
            result = false;
            alert('password');
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

    const registerAction = async () =>{

        const formData = {
            email: 'operationddd2@gmail.com',
            lastName: 'VO',
            firstName: 'Dung',
            password: 'Mashiro1',
        }
        // axios.post('http://localhost:8080/api/v1/registration', formData, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // })
        //     .then((response) => {
        //         alert(response);
        //     })
        //     .catch((error) => {
        //         alert(error);
        //     });

        // const headers = {
        //     "Content-Type": "application/json",
        //   };
        // const url = "http://localhost:8080/api/v1/registration/hello";
        // axios.get(url, { headers })
        //     .then((response) => {
        //         alert(response);
        //     })
        //     .catch((error) => {
        //         alert(error)
        //     })

        fetch('http://localhost:8080/api/v1/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                // Xử lý kết quả trả về từ server
                alert('Response from server:'+ data);
            })
            .catch((error) => {
                alert('Error:'+ error);
            });

        // if(validateCredentials()){
        //     const formData = {
        //         email: email,
        //         lastName: lastName,
        //         firstName: firstName,
        //         password: password,
        //     }
        //     axios.post('http://localhost:8080/api/v1/registration',formData)
        //     .then((response)=>{
        //         alert(response);
        //     })
        //     .catch((error)=>{
        //         alert(error);
        //     });
        // }
        // else{
        //     alert('SomeThing wrong!');
        // }
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