import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./AuthPage.css";

const AuthPage = () => {
    const [rightPanelActive, setRightPanelActive] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, register } = useContext(AuthContext);

    const formikLogin = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validateOnChange: Yup.object({
            email: Yup.string().required(),
            password: Yup.string().required(),
        }),
        onSubmit: async ({ email, password }) => {
            await login(email, password, rememberMe);
        },
    });

    const formikRegister = useFormik({
        initialValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        validateOnChange: Yup.object({
            email: Yup.string().required(),
            password: Yup.string().required(),
            confirmPassword: Yup.string().required(),
        }),
        onSubmit: async (
            { email, password, confirmPassword },
            { resetForm }
        ) => {
            try {
                await register(email, password, confirmPassword);
                setRightPanelActive(false);
                resetForm();
            } catch (err) {}
        },
    });

    return (
        <div className='auth-page'>
            <div
                className={`container ${
                    rightPanelActive ? "right-panel-active" : ""
                }`}
            >
                <div className='form-container register-container'>
                    <form onSubmit={formikRegister.handleSubmit}>
                        <h1>Register hire.</h1>
                        <input
                            name='email'
                            type='email'
                            placeholder='Email'
                            {...formikRegister.getFieldProps("email")}
                        />
                        <input
                            name='password'
                            type='password'
                            placeholder='Mật khẩu'
                            {...formikRegister.getFieldProps("password")}
                        />
                        <input
                            name='confirmPassword'
                            type='password'
                            placeholder='Xác nhận mật khẩu'
                            {...formikRegister.getFieldProps("confirmPassword")}
                        />
                        <button type='submit'>Register</button>
                        <span>or use your account</span>
                        <div className='social-container'></div>
                    </form>
                </div>

                <div className='form-container login-container'>
                    <form onSubmit={formikLogin.handleSubmit}>
                        <h1>Login hire.</h1>
                        <input
                            name='email'
                            type='email'
                            placeholder='Email'
                            {...formikLogin.getFieldProps("email")}
                        />
                        <input
                            name='password'
                            type='password'
                            placeholder='Password'
                            {...formikLogin.getFieldProps("password")}
                        />
                        <div className='content'>
                            <div className='checkbox'>
                                <input
                                    type='checkbox'
                                    id='remember-me'
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                />
                                <label htmlFor='remember-me'>Remember me</label>
                            </div>
                            <div className='pass-link'>
                                <Link to={"/auth/forgot"}>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <button type='submit'>Login</button>
                        <span>or use your account</span>
                        <div className='social-container'></div>
                    </form>
                </div>

                <div className='overlay-container'>
                    <div className='overlay'>
                        <div className='overlay-panel overlay-left'>
                            <h1 className='title'>
                                Hello <br /> friends
                            </h1>
                            <p>
                                if you have an account yet, login here and have
                                fun.
                            </p>
                            <button
                                className='ghost'
                                onClick={() => setRightPanelActive(false)}
                            >
                                Login
                            </button>
                        </div>
                        <div className='overlay-panel overlay-right'>
                            <h1 className='title'>
                                Start you <br /> journey now
                            </h1>
                            <p>
                                if you don't have an account yet, join us and
                                start your journey.
                            </p>
                            <button
                                className='ghost'
                                onClick={() => setRightPanelActive(true)}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
