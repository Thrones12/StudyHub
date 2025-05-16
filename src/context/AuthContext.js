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
    const [userId, setUserId] = useState(null);

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

                if (res.status === 200 && res.data.userId) {
                    setUserId(res.data.userId); // hoặc setUser(res.data.user)
                } else {
                    throw new Error("Token không hợp lệ");
                }
            } catch (err) {
                // Nếu token hết hạn hoặc không hợp lệ
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                navigate("/auth");
            }
        };

        checkLogin();
    }, [API, userId]);

    // Kiểm tra learning hour của user
    useEffect(() => {
        const checkLearningHour = async () => {
            try {
                await axios.post(`${API}/user/check-learning-hour`, { userId });
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Check learning hour thất bại");
                }
            }
        };

        if (userId) checkLearningHour();
    }, [API, userId]);

    const login = async (email, password, rememberMe) => {
        logout();
        try {
            const res = await axios.post(`${API}/user/login`, {
                email,
                password,
            });

            if (res.status === 200) {
                const { token, userId } = res.data.data;

                // Lưu token theo rememberMe
                if (rememberMe) {
                    localStorage.setItem("token", token);
                } else {
                    sessionStorage.setItem("token", token);
                }

                // Cập nhật state userId
                setUserId(userId);

                // Thông báo và chuyển hướng
                Noti.success("Đăng nhập thành công");
                navigate("/");
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đăng nhập thất bại");
            }
        }
    };

    const register = async (email, password, confirmPassword) => {
        try {
            // Kiểm tra khớp mật khẩu
            if (password !== confirmPassword) {
                Noti.error("Mật khẩu không khớp");
                return;
            }

            const res = await axios.post(`${API}/user/register`, {
                email,
                password,
            });

            if (res.status === 200) {
                Noti.success("Đăng ký thành công");
                // Chuyển hướng đến trang đăng nhập hoặc tự động đăng nhập
                navigate("/auth"); // hoặc navigate("/") nếu tự động login
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đăng ký thất bại");
            }
        }
    };

    const logout = () => {
        // Xóa token ở cả localStorage và sessionStorage
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        // Cập nhật lại trạng thái trong app
        setUserId(null);

        // Chuyển hướng về trang đăng nhập
        navigate("/auth");
    };

    const sendOtp = async (email) => {
        try {
            await axios.post(`${API}/user/send-otp`, { email });
            Noti.info("OTP đã được gửi về email");
            navigate("/auth/verify", { state: { email } });
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Gửi OTP thất bại");
            }
        }
    };

    const verify = async (email, inputOtp) => {
        try {
            await axios.post(`${API}/user/verify`, { email, inputOtp });
            return true;
        } catch (err) {
            return false;
        }
    };

    const sendPassword = async (email) => {
        await axios.post(`${API}/user/send-password`, { email });
        Noti.success("Mật khẩu mới đã được gửi đến email của bạn");
        navigate("/auth");
    };

    return (
        <AuthContext.Provider
            value={{
                userId,
                login,
                register,
                logout,
                sendOtp,
                verify,
                sendPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
