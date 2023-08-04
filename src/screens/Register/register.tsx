import React, {ChangeEvent,FormEvent, useState} from "react";
import useRegister from "./useRegister";

const Register = () => {

    const [isLoading,setIsLoading] = useState(false);

    const {email,lastName,firstName,password,rePassword,
    setEmail,setLastName,setFirstName,setPassword,setRePassword,
    emailError,lastNameError,fristNameError,rePasswordError,
    registerAction
    } = useRegister();

    const handleChangeEmail = (event : ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setEmail(value); 
    };
    const handleChangeLastName = (event : ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setLastName(value); 
    };
    const handleChangeFristName = (event : ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setFirstName(value); 
    };
    const handleChangePassword = (event : ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPassword(value); 
    };
    const handleChangeRePassword = (event : ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setRePassword(value); 
    };
    async function handleRegister (event : FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        try {
            await registerAction();
            setIsLoading(false);
          } catch (error) {
            setIsLoading(false);
          }
    }

    return (
        <div className="login-screen">
            <div className="background-flur"/>
            <div className="login-section sadow">
                <div className="row shadow h-100">
                <div className="col-6 wrap-left center">
                        <p className="title white">Login Account</p>
                        <form className="form-login" onSubmit={handleRegister}>
                            <div className="form-outline mb-4">
                                <label className="lable">Email</label>
                                <input placeholder="email" value={email} onChange={handleChangeEmail}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="lable">Last Name</label>
                                <input placeholder="last name" value={lastName} onChange={handleChangeLastName}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="lable">First Name</label>
                                <input placeholder="frist name" value={firstName} onChange={handleChangeFristName}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="lable">Password</label>
                                <input placeholder="password" value={password} onChange={handleChangePassword}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="lable">ReType-Password</label>
                                <input placeholder="retype passwrod" value={rePassword} onChange={handleChangeRePassword}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <button className="button-login" type="submit" disabled={isLoading} style={{backgroundColor: isLoading? "white" : "green"}}>SGIN UP</button>
                            </div>
                        </form>
                        <div className="row center">
                            <p className="mb-4">Already have an account?</p>
                            <a className="herf white">SIGIN IN</a>
                        </div>
                    </div>
                    <div className="col-6 wrap-right center background-left">
                        <p className="description white">Nice to meet you from TIPCONNECT</p>
                        <p className="title white">WELCOME COME</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;