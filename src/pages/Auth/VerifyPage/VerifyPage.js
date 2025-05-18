import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import Noti from "../../../utils/Noti";
import styles from "./VerifyPage.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltLeft } from "@fortawesome/free-solid-svg-icons";
import { motion, time } from "framer-motion";

const VerifyPage = () => {
    const nav = useNavigate();
    const { SendOtp, ActiveAccount, SendNewPassword } = useContext(AuthContext);
    const location = useLocation();
    const { email, type } = location.state || {};
    const inputRefs = useRef([]);
    const [correctOtp, setCorrectOtp] = useState();
    const hasSentOtp = useRef(false);
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [time, setTime] = useState(180);
    const [canResend, setCanResend] = useState(false);

    // Kiểm tra web có email hay không
    useEffect(() => {
        const SendOTPToEmail = async (email) => {
            const res = await SendOtp(email);
            if (res) {
                setCorrectOtp(res);
                setCanResend(false);
                setTime(180); // reset timer
                Noti.success("Đã gửi OTP đến email của bạn");
            }
        };

        if (!email) {
            Noti.warning("Email không hợp lệ");
            return;
        }
        if (hasSentOtp.current) {
            return;
        }
        hasSentOtp.current = true;
        SendOTPToEmail(email);
    }, [email]);
    // Đếm ngược thời gian
    useEffect(() => {
        if (!correctOtp) return; // Chưa có OTP thì không đếm
        if (time <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [time, correctOtp]);
    // Gửi lại OTP
    const handleResend = async () => {
        if (!canResend) return;

        try {
            await SendOtp(email);
            setCanResend(false);
            setTime(180); // reset lại 3 phút
            Noti.success("Đã gửi lại OTP");
        } catch (err) {
            Noti.error("Gửi lại OTP thất bại");
        }
    };
    // Xử lý sự kiện khi nhập OTP
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!/^[0-9]*$/.test(value)) return;
        if (value.length !== 1 && value.length !== 6) return;
        // Nếu người dùng paste 1 chuỗi số
        if (value.length > 1) {
            const newOtp = value.slice(0, otp.length).split("");
            setOtp(newOtp);
            // Focus ô cuối cùng
            inputRefs.current[Math.min(newOtp.length, otp.length - 1)].focus();
            return;
        }
        if (otp[index] !== value) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
        }
        // Nếu có giá trị, focus sang input tiếp theo
        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };
    // Xử lý sự kiện khi nhấn phím Backspace
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newOtp = [...otp];

            if (otp[index]) {
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            }
        }
    };
    // Xử lý sự kiện khi focus vào input
    const handleFocus = (e) => {
        e.target.select();
    };
    // Xử lý sự kiện khi nhấn nút xác nhận
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.join("") === correctOtp) {
            if (type === "register") {
                registerSubmit(email);
            }
            if (type === "forgot") {
                forgotPasswordSubmit(email);
            }
        } else {
            Noti.warning("Mã OTP không chính xác");
            setOtp(new Array(6).fill(""));
        }
    };
    // Xử lý sự kiện khi xác thực thành công cho đăng ký
    const registerSubmit = async (email) => {
        try {
            const res = await ActiveAccount(email);
            if (res) {
                Noti.success(res);
                nav("/auth");
            }
        } catch (err) {
            Noti.error(err.response.data?.message);
        }
    };
    const forgotPasswordSubmit = async (email) => {
        try {
            const res = await SendNewPassword(email);
            if (res) {
                Noti.success(res);
                nav("/auth");
            }
        } catch (err) {
            Noti.error(err.response.data?.message);
        }
    };
    const changePasswordSubmit = async (email) => {};
    return (
        <div className={styles.verifyPage}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.verifyModal}>
                    <form onSubmit={handleSubmit}>
                        <h2>Xác thực OTP</h2>
                        <p className={styles.description}>
                            Vui lòng nhập mã xác minh mà chúng tôi đã gửi tới
                            <br />
                            <span>{email}</span>
                        </p>
                        <div className={styles.inputGroup}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    type='text'
                                    inputMode='numeric'
                                    value={digit}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    onInput={(e) => handleChange(e, i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    onFocus={handleFocus}
                                />
                            ))}
                        </div>
                        <button className={styles.submitButton}>
                            Xác nhận
                        </button>
                        <p className={styles.resend}>
                            {canResend ? (
                                <Link
                                    onClick={handleResend}
                                    className={styles.resendLink}
                                >
                                    Gửi lại
                                </Link>
                            ) : (
                                <span className={styles.timer}>
                                    Gửi lại sau {Math.floor(time / 60)}:
                                    {String(time % 60).padStart(2, "0")}
                                </span>
                            )}
                        </p>
                        <div
                            className={styles.backLink}
                            onClick={() => nav(-1)}
                        >
                            <FontAwesomeIcon icon={faLongArrowAltLeft} />
                            <p>Quay lại</p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyPage;
