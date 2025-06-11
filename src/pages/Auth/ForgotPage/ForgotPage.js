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
    // REACT
    const nav = useNavigate();
    // STATE
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    // Xử lý khi nhấn Xác nhận
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
                        {/* Thông báo lỗi */}
                        <div className={styles.error}>
                            {error ? `* ${error}` : ""}
                        </div>
                        {/* Email */}
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

export default ForgotPage;
