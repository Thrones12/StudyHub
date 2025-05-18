import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import constants from "../utils/constants";
import Noti from "../utils/Noti";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const API = constants.API;
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Kiểm tra trạng thái đăng nhập khi load trang
    useEffect(() => {
        const checkLogin = async () => {
            const excludedPaths = [
                "/auth",
                "/auth/register",
                "/auth/verify",
                "/auth/forgot",
            ];
            const currentPath = location.pathname;
            if (excludedPaths.includes(currentPath)) {
                return; // Bỏ qua kiểm tra login cho các path này
            }

            const storedToken =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

            if (!storedToken) {
                navigate("/auth"); // Chưa đăng nhập
                return;
            }

            try {
                const res = await axios.get(`${API}/user/verify-token`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                if (res.status === 200 && res.data.user) {
                    setUser(res.data.user); // hoặc setUser(res.data.user)
                } else {
                    throw "Token không hợp lệ";
                }
            } catch (err) {
                // Nếu token hết hạn hoặc không hợp lệ
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                navigate("/auth");
            }
        };

        checkLogin();
    }, [API, user]);

    // Kiểm tra learning hour của user
    useEffect(() => {
        const checkLearningHour = async () => {
            try {
                await axios.post(`${API}/user/check-learning-hour`, {
                    userId: user._id,
                });
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Check learning hour thất bại");
                }
            }
        };

        if (user) checkLearningHour();
    }, [API, user]);
    // Đăng nhập
    const Login = async ({ username, password, rememberMe = "'" }) => {
        // Đăng xuất trước (xoá token cũ nếu có)
        logout();
        // Kiểm tra đầu vào
        if (!username) {
            throw "Vui lòng nhập tên đăng nhập";
        }
        if (!password) {
            throw "Vui lòng nhập mật khẩu";
        }
        try {
            const res = await axios.post(`${API}/auth/login`, {
                username,
                password,
            });

            const { token, user } = res.data?.data || {};

            if (!token || !user) {
                throw "Dữ liệu phản hồi không hợp lệ";
            }

            // Lưu token theo rememberMe
            if (rememberMe) {
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("token", token);
            }

            // Cập nhật state
            setUser(user);
            return res.data?.message || "Đăng nhập thành công";
        } catch (error) {
            if (error.response && error.response.data?.message) {
                throw error.response.data.message || "Đăng nhập thất bại";
            } else {
                throw "Không thể kết nối đến máy chủ";
            }
        }
    };
    // Đăng ký
    const Register = async ({
        lastName,
        firstName,
        username,
        email,
        password,
        confirmPassword,
    }) => {
        try {
            const res = await axios.post(`${API}/auth/register`, {
                lastName: lastName,
                firstName: firstName,
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
            });
            return res.data.message;
        } catch (error) {
            if (error.response && error.response.data?.message) {
                throw error.response.data.message || "Đăng ký thất bại";
            } else {
                throw "Không thể kết nối đến máy chủ";
            }
        }
    };
    // Đăng xuất
    const logout = () => {
        // Xóa token ở cả localStorage và sessionStorage
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        // Cập nhật lại trạng thái trong app
        setUser(null);

        // Chuyển hướng về trang đăng nhập
        navigate("/auth");
    };
    // Gửi OTP
    const SendOtp = async (email) => {
        let otp;
        await axios
            .post(`${API}/auth/send-otp`, { email })
            .then((res) => {
                otp = res.data.otp;
            })
            .catch((err) => {
                return Noti.warning(
                    err.response.data?.message || "Gửi mã xác thực thất bại"
                );
            });
        return otp;
    };
    // Kích hoạt tài khoản
    const ActiveAccount = async (email) => {
        try {
            const res = await axios.post(`${API}/auth/active-account`, {
                email,
            });
            return res.data.message;
        } catch (error) {
            if (error.response && error.response.data?.message) {
                throw (
                    error.response.data.message ||
                    "Kích hoạt tài khoản thất bại"
                );
            } else {
                throw "Không thể kết nối đến máy chủ";
            }
        }
    };
    // Gửi mật khẩu mới
    const SendNewPassword = async (email) => {
        try {
            const res = await axios.post(`${API}/auth/send-new-password`, {
                email,
            });
            return res.data.message;
        } catch (error) {
            if (error.response && error.response.data?.message) {
                throw (
                    error.response.data.message || "Gửi mật khẩu mới thất bại"
                );
            } else {
                throw "Không thể kết nối đến máy chủ";
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                Login,
                Register,
                logout,
                SendOtp,
                ActiveAccount,
                SendNewPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
