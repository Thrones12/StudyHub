import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import constants from "../../../utils/constants";
import Noti from "../../../utils/Noti";
import "./ForgotPage.css";

const ForgotPage = () => {
    const { sendOtp } = useContext(AuthContext);
    const [email, setEmail] = useState();

    const sendOTP = async (e) => {
        e.preventDefault();
        await sendOtp(email);
    };

    return (
        <div className='forgot-page'>
            <div className='container'>
                <div className={`flip-card `}>
                    <div className='flip-card-inner'>
                        <div className='flip-card-front'>
                            <div className='flip-card-front-header'></div>
                            <h3>Quên mật khẩu</h3>
                            <p>
                                Nhập Email của tài khoản cần tìm lại mật khẩu.
                            </p>
                            <form>
                                <input
                                    type='email'
                                    placeholder='Email'
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button
                                    className='active'
                                    onClick={(e) => sendOTP(e)}
                                >
                                    Xác nhận
                                </button>
                            </form>

                            <p>
                                Quay lại đăng nhập?{" "}
                                <span>
                                    <Link to='/auth/login'>Quay lại</Link>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPage;
