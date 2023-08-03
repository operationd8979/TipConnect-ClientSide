import React from "react";

const Login = () => {

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
                                <input placeholder="email"></input>
                            </div>
                            <div className="form-outline mb-4">
                                <label className="lable">Password</label>
                                <input placeholder="password"></input>
                            </div>
                            <div className="form-outline mb-4">
                                <button className="button-login">LOGIN</button>
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