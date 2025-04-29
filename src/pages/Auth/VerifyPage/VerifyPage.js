import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import Noti from "../../../utils/Noti";
import "./VerifyPage.css";

const VerifyPage = () => {
    const { sendOtp, verify, sendPassword } = useContext(AuthContext);
    const location = useLocation();
    const email = location.state?.email;
    const inputFieldRef = useRef(null);
    const [inputOTP, setInputOTP] = useState(["", "", "", ""]);
    const [inputs, setInputs] = useState([]);
    useEffect(() => {
        if (inputFieldRef.current) {
            const inputElements =
                inputFieldRef.current.querySelectorAll("input");
            setInputs(inputElements);
        }
    }, []);
    const handleInputOTP = (e, index) => {
        setInputOTP((prevArray) => {
            const newArray = [...prevArray];
            newArray[index] = e.target.value.slice(-1);
            return newArray;
        });

        // Chuyển focus sang input tiếp theo nếu có
        if (index < inputs.length - 1 && e.target.value) {
            inputs[index + 1].focus();
        }

        // Chuyển focus sang input trước nếu xóa
        if (index > 0 && e.target.value == "") {
            inputs[index - 1].focus();
        }
    };

    const sendOTP = async (e) => {
        e.preventDefault();
        await sendOtp(email);
    };

    const submitVertify = async (e) => {
        e.preventDefault();
        const res = await verify(email, inputOTP.join(""));
        if (res) {
            await sendPassword(email);
        } else {
            Noti.error("Xác thực thất bại");
        }
    };
    return (
        <div className='forgot-page'>
            <div className='container'>
                <div className={`flip-card active`}>
                    <div className='flip-card-inner'>
                        <div className='flip-card-back'>
                            <div className='flip-card-back-header'></div>
                            <h3>Enter OTP</h3>
                            <p>OTP đã được gửi qua Email</p>
                            <form onSubmit={(e) => submitVertify(e)}>
                                <div
                                    className='input-field'
                                    ref={inputFieldRef}
                                >
                                    <input
                                        type='number'
                                        value={inputOTP[0]}
                                        onChange={(e) => handleInputOTP(e, 0)}
                                    />
                                    <input
                                        type='number'
                                        value={inputOTP[1]}
                                        onChange={(e) => handleInputOTP(e, 1)}
                                    />
                                    <input
                                        type='number'
                                        value={inputOTP[2]}
                                        onChange={(e) => handleInputOTP(e, 2)}
                                    />
                                    <input
                                        type='number'
                                        value={inputOTP[3]}
                                        onChange={(e) => handleInputOTP(e, 3)}
                                    />
                                </div>
                                <button
                                    className={`${
                                        inputOTP.every((i) => i != "")
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    Xác nhận
                                </button>
                            </form>
                            <p>
                                Chưa nhận được?{" "}
                                <span>
                                    <Link to='#' onClick={(e) => sendOTP(e)}>
                                        Gửi lại
                                    </Link>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;
