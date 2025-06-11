import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.scss";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContext";
import { SquareCheckbox } from "../../../components";

export default function LoginPage() {
    // React
    const nav = useNavigate();
    const { Login, Logout } = useContext(AuthContext);
    // STATE
    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    // State kiểm tra xem có hiển thị password không
    const [showPassword, setShowPassword] = useState(false);
    // State kiểm tra xem có ghi nhớ đăng nhập không
    const [isRemember, setIsRemember] = useState(false);
    // State hiển thị báo lỗi khi đăng nhập thất bại
    const [error, setError] = useState("");

    // Đăng xuất tài khoản cũ mỗi khi người dùng truy cập trang đăng nhập
    useEffect(() => {
        Logout();
    }, []);

    // Xử lý thay đổi input username và password
    const handleChange = ({ target: { name, value } }) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    // Xử lý khi nhấn Đăng nhập
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Làm mới error để tránh trường hợp error cũ còn sót lại
        setError("");
        // Bắt đầu tiến hành đăng nhập
        try {
            // Đăng nhập
            const res = await Login({
                username: form.username,
                password: form.password,
                isRemember: isRemember,
            });
            // Đúng --> dựa vào role của user để điều hướng | role = [user, admin]
            if (res.user.role === "user") nav("/");
            else nav("/admin");
        } catch (err) {
            // Sai --> setError để báo lỗi
            // Các trường hợp lỗi có thể xảy ra:
            // 1. Người dùng không tồn tại
            // 2. Mật khẩu không chính xác
            // 3. Tài khoản bị khóa. Vui lòng liên hệ hỗ trợ qua Hotline: 0981141000
            // 4. Tài khoản chưa xác thực --> Hỏi người dùng có muốn xác thực không
            setError(
                err?.response?.data?.message ||
                    err.message ||
                    "Đăng nhập thất bại"
            );
        }
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
                        {/* Trái */}
                        <div className={styles.colLeft}>
                            <form onSubmit={handleSubmit} autoComplete='off'>
                                <h2>Chào mừng trở lại!</h2>
                                <p className={styles.description}>
                                    Đăng nhập ngay để tiếp tục chuyến hành trình
                                    <br /> khám phá kiến thức của bạn.
                                </p>
                                {/* Báo lỗi */}
                                <div className={styles.error}>
                                    {error ? `* ${error}` : ""}
                                </div>
                                {/* Username */}
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
                                {/* Password */}
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

                                <div
                                    className={styles.FlexRow}
                                    style={{
                                        justifyContent: "space-between",
                                        margin: "15px 0 20px",
                                    }}
                                >
                                    <div className={styles.FlexRow}>
                                        <SquareCheckbox
                                            checked={!!isRemember}
                                            onChange={() =>
                                                setIsRemember(!isRemember)
                                            }
                                        />
                                        <label
                                            className={styles.forgotText}
                                            onClick={() =>
                                                setIsRemember(!isRemember)
                                            }
                                        >
                                            Ghi nhớ đăng nhập
                                        </label>
                                    </div>
                                    <p className={styles.forgotText}>
                                        <Link to={"/auth/forgot"}>
                                            Quên mật khẩu?
                                        </Link>
                                    </p>
                                </div>

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
                                <h2>Welcome to Study Hub</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
