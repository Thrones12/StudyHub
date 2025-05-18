import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./ForgotPage.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLightbulb,
    faLongArrowAltLeft,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const ForgotPage = () => {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email.trim() === "") {
            setError("Vui lòng nhập địa chỉ email");
        } else {
            nav("/auth/verify", {
                state: {
                    email,
                    type: "forgot",
                },
            });
        }
    };

    return (
        <div className={styles.forgotPage}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.forgotModal}>
                    <form onSubmit={handleSubmit}>
                        <h2>Tìm lại mật khẩu</h2>
                        <p className={styles.description}>
                            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ
                            gửi mã xác thực đến email của bạn.
                            <br />
                            <span>
                                <FontAwesomeIcon icon={faLightbulb} />: Kiểm tra
                                cả hộp thư rác.
                            </span>
                        </p>

                        <div className={styles.error}>
                            {error ? `* ${error}` : ""}
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type='email'
                                name='email'
                                placeholder='Địa chỉ email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className={styles.submitButton}>
                            Xác nhận
                        </button>
                        <div className={styles.backLink}>
                            <FontAwesomeIcon icon={faLongArrowAltLeft} />
                            <p>Quay lại</p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
        // <div className='forgot-page'>
        //     <div className='container'>
        //         <div className={`flip-card `}>
        //             <div className='flip-card-inner'>
        //                 <div className='flip-card-front'>
        //                     <div className='flip-card-front-header'></div>
        //                     <h3>Quên mật khẩu</h3>
        //                     <p>
        //                         Nhập Email của tài khoản cần tìm lại mật khẩu.
        //                     </p>
        //                     <form>
        //                         <input
        //                             type='email'
        //                             placeholder='Email'
        //                             onChange={(e) => setEmail(e.target.value)}
        //                         />
        //                         <button
        //                             className='active'
        //                             onClick={(e) => sendOTP(e)}
        //                         >
        //                             Xác nhận
        //                         </button>
        //                     </form>

        //                     <p>
        //                         Quay lại đăng nhập?{" "}
        //                         <span>
        //                             <Link to='/auth/login'>Quay lại</Link>
        //                         </span>
        //                     </p>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
};

export default ForgotPage;
