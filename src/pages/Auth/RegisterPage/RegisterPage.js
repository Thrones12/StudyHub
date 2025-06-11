import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.scss";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../../services/User";
import { AuthContext } from "../../../context/AuthContext";

export default function RegisterPage() {
    // REACT
    const nav = useNavigate();
    const { Register } = useContext(AuthContext);
    // STATE
    const [form, setForm] = useState({
        lastName: "",
        firstName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    // State kiểm tra xem có hiển thị password không
    const [showPassword, setShowPassword] = useState(false);
    // State kiểm tra xem có hiển thị nhập lại password không
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // State hiển thị báo lỗi khi đăng ký thất bại
    const [error, setError] = useState("");
    // Chuyển con trỏ chuột + text trong button Đăng ký khi đang submit
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        document.body.style.cursor = loading ? "wait" : "default";
        return () => {
            document.body.style.cursor = "default";
        };
    }, [loading]);

    // Xử lý thay đổi input username và password
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Xử lý khi nhấn Đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra định dạng tên đăng nhập
        if (!/^[a-zA-Z0-9_]{3,}$/.test(form.username)) {
            setError("Tên đăng nhập phải có ít nhất 3 ký tự, không dấu.");
            return;
        }
        // Kiểm tra định dạng tên đăng nhập
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError("Email không hợp lệ.");
            return;
        }
        // So sánh 2 mật khẩu
        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu không khớp.");
            return;
        }
        setError("");
        // Bắt đầu tiến hành đăng ký
        try {
            // Chuyển trạng thái thành loading
            setLoading(true);
            // Đăng ký
            const res = await Register({
                fullname: `${form.lastName} ${form.firstName}`,
                username: form.username,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
            });
            // Đúng --> hệ thống tạo tài khoản mới với trạng thái chưa xác thực sau đó điều hướng sang trang xác thực để người dùng xác thực tài khoản
            if (res) {
                nav("/auth/verify", {
                    state: {
                        email: form.email, // Email của tài khoản đăng ký để gửi mã xác thực OTP
                        type: "register", // loại xác thực | register: thành công thì nav sang trang đăng nhập
                    },
                });
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err.message ||
                    "Đăng nhập thất bại"
            );
        } finally {
            setLoading(false);
        }
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
                                {/* Báo lỗi */}
                                <div className={styles.error}>
                                    {error ? `* ${error}` : ""}
                                </div>
                                {/* Họ tên */}
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
                                {/* Tên đăng nhập */}
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
                                {/* Email */}
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
                                {/* Mật khẩu */}
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
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
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
                                {/* Nhập lại mật khẩu */}
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
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                showConfirmPassword
                                                    ? faEyeSlash
                                                    : faEye
                                            }
                                        />
                                    </span>
                                </div>
                                {/* Link quên mật khẩu */}
                                <p className={styles.forgotText}>
                                    <Link to={"/auth/forgot"}>
                                        Quên mật khẩu?
                                    </Link>
                                </p>
                                {/* Nút đăng ký */}
                                <button
                                    type='submit'
                                    className={styles.submitButton}
                                >
                                    {loading ? "Đang tạo..." : "Tạo tài khoản"}{" "}
                                </button>
                                {/* Link trang đăng nhập  */}
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
