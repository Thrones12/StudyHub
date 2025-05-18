import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.scss";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../../services/User";
import { AuthContext } from "../../../context/AuthContext";

export default function RegisterPage() {
    const nav = useNavigate();
    const { Register } = useContext(AuthContext);
    const [form, setForm] = useState({
        lastName: "",
        firstName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword((prev) => !prev);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }
        setError("");

        await Register({
            lastName: form.lastName,
            firstName: form.firstName,
            username: form.username,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
        })
            .then((res) => {
                if (res) {
                    nav("/auth/verify", {
                        state: {
                            email: form.email,
                            type: "register",
                        },
                    });
                }
            })
            .catch((err) => {
                setError(err);
            });
    };
    return (
        <div className={styles.registerPage}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.registerModal}>
                    <div
                        className={styles.row}
                        style={{
                            padding: "30px",
                        }}
                    >
                        {/* Form Section */}
                        <div className={styles.colLeft}>
                            <form onSubmit={handleSubmit}>
                                <h2>Đăng ký</h2>
                                <p className={styles.description}>
                                    Đăng ký tài khoản ngay để bắt đầu chuyến
                                    hành trình
                                    <br /> khám phá kiến thức của bạn.
                                </p>

                                <div className={styles.error}>
                                    {error ? `* ${error}` : ""}
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.col_6}>
                                        <div className={styles.inputGroup}>
                                            <input
                                                autoComplete='given-name'
                                                type='text'
                                                name='lastName'
                                                placeholder='Họ'
                                                value={form.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.col_6}>
                                        <div className={styles.inputGroup}>
                                            <input
                                                autoComplete='family-name'
                                                type='text'
                                                name='firstName'
                                                placeholder='Tên'
                                                value={form.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type='text'
                                        name='username'
                                        placeholder='Tên đăng nhập'
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type='email'
                                        name='email'
                                        placeholder='Địa chỉ email'
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name='password'
                                        placeholder='Mật khẩu'
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className={styles.icon}
                                        onClick={togglePassword}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                showPassword
                                                    ? faEyeSlash
                                                    : faEye
                                            }
                                        />
                                    </span>
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name='confirmPassword'
                                        placeholder='Nhập lại mật khẩu'
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className={styles.icon}
                                        onClick={toggleConfirmPassword}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                showPassword
                                                    ? faEyeSlash
                                                    : faEye
                                            }
                                        />
                                    </span>
                                </div>

                                <p className={styles.forgotText}>
                                    <Link to={"/auth/forgot"}>
                                        Quên mật khẩu?
                                    </Link>
                                </p>

                                <button
                                    type='submit'
                                    className={styles.submitButton}
                                >
                                    Tạo tài khoản
                                </button>

                                <p className={styles.loginText}>
                                    Bạn đã có tài khoản?{" "}
                                    <Link to='/auth/login'>Đăng nhập</Link>
                                </p>
                            </form>
                        </div>

                        {/* Image Section */}
                        <div className={styles.colRight}>
                            <div className={styles.imageBox}>
                                <img
                                    src='/images/register-img.png'
                                    alt='Welcome'
                                />
                                <h2>Welcome to Tuga's App</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
