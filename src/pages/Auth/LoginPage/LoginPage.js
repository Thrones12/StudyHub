import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.scss";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContext";

export default function LoginPage() {
    const nav = useNavigate();
    const { Login } = useContext(AuthContext);
    const [form, setForm] = useState({
        username: "hungphongpq1",
        password: "Phong@123",
    });
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword((prev) => !prev);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        await Login({
            username: form.username,
            password: form.password,
        })
            .then((res) => {
                if (res.role === "user") {
                    nav("/");
                } else {
                    nav("/admin");
                }
            })
            .catch((err) => {
                setError(err);
            });
    };

    return (
        <div className={styles.loginPage}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.loginForm}>
                    <div
                        className={styles.row}
                        style={{
                            padding: "30px",
                        }}
                    >
                        {/* Form Section */}
                        <div className={styles.colLeft}>
                            <form onSubmit={handleSubmit} autoComplete='off'>
                                <h2>Chào mừng trở lại!</h2>
                                <p className={styles.description}>
                                    Đăng nhập ngay để tiếp tục chuyến hành trình
                                    <br /> khám phá kiến thức của bạn.
                                </p>

                                <div className={styles.error}>
                                    {error ? `* ${error}` : ""}
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

                                <p className={styles.forgotText}>
                                    <Link to={"/auth/forgot"}>
                                        Quên mật khẩu?
                                    </Link>
                                </p>

                                <button
                                    type='submit'
                                    className={styles.submitButton}
                                >
                                    Đăng nhập
                                </button>

                                <p className={styles.loginText}>
                                    Bạn chưa có tài khoản?{" "}
                                    <Link to='/auth/register'>Đăng ký</Link>
                                </p>
                            </form>
                        </div>

                        {/* Image Section */}
                        <div className={styles.colRight}>
                            <div className={styles.imageBox}>
                                <img
                                    src='/images/login-img.png'
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
