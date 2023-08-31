import React, {useContext, useState, ChangeEvent} from "react";
import userContext from "../../context/User/userContext";
import { log } from "console";
import axios from "axios";


const Login = () => {

    const state = useContext(userContext);
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const handleLogin = async () =>{
        console.log('handle login')
        if(email&&password){
            const formData = {
                email: email,
                password: password,
            }
            try{
                const response = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
                alert("Đăng nhập thành công, tokken: " + response.data);
                console.log(response)
            }catch(error){
                alert("Lỗi đăng nhập: " + error);
                console.log(error)
            }
        }
    }

    console.log(state);

    return (
        <div className="login-screen">
            <div className="background-flur"/>
            <div className="login-section sadow">
                <div className="row shadow h-100">
                    <div className="col-6 wrap-left center background-left">
                        <p className="description white">Nice to meet you from TIPCONNECT</p>
                        <p className="title white">WELCOME BACK</p>
                    </div>
                    <div className="col-6 wrap-right center">
                        <p className="title white">Login Account</p>
                        <form className="form-login">
                            <div className="form-outline mb-4">
                                <label className="lable">Email</label>
                                <input placeholder="email" value={email} onChange={(e:ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="lable">Password</label>
                                <input placeholder="password" value={password} onChange={(e:ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)}></input>
                            </div>
                            <div className="form-outline mb-4">
                                <button className="button-login" onClick={handleLogin}>LOGIN</button>
                            </div>
                        </form>
                        <div className="row center">
                            <p className="mb-4">Don't have an account?</p>
                            <a className="herf white">CREATE NEW</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}


export default Login;