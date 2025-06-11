import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import constants from "../utils/constants";
import Noti from "../utils/Noti";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const API = constants.API;
    const nav = useNavigate();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Kiểm tra trạng thái đăng nhập khi load trang
    useEffect(() => {
        const verifyToken = async () => {
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

            // Thiết lập token cho các request sau này
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${storedToken}`;

            try {
                const res = await axios.post(
                    `${API}/auth/verify-token`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    }
                );

                if (res.status === 200 && res.data?.user) {
                    setUser(res.data.user);
                    if (
                        location.pathname.includes("admin") &&
                        res.data.user.role === "user"
                    ) {
                        nav("/auth");
                    }
                } else {
                    throw "Token không hợp lệ";
                }
            } catch (err) {
                // Token sai hoặc hết hạn => xóa và chuyển hướng
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                Noti.warning(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
                navigate("/auth");
            }
        };

        if (user === null) {
            verifyToken();
        }
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
    const Login = async ({ username, password, isRemember = false }) => {
        // Kiểm tra đầu vào
        if (!username) {
            throw new Error("Vui lòng nhập tên đăng nhập");
        }
        if (!password) {
            throw new Error("Vui lòng nhập mật khẩu");
        }
        try {
            const res = await axios.post(`${API}/auth/login`, {
                username,
                password,
            });

            const { token, user } = res.data?.data || {};
            if (!token || !user)
                throw new Error("Dữ liệu phản hồi không hợp lệ");

            // Lưu token theo isRemember
            if (isRemember) localStorage.setItem("token", token);
            else sessionStorage.setItem("token", token);

            // Thiết lập token cho các request sau này
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Cập nhật state
            setUser(user);
            return { user, token };
        } catch (error) {
            if (error?.response?.data?.isVerify === false) {
                Noti.infoWithYesNo({
                    title: "Xác thực tài khoản",
                    text: "Tài khoản hiện tại chưa được xác thực, bạn có muốn xác thực tài khoản không?",
                    func: () => {
                        nav("/auth/verify", {
                            state: {
                                email: error.response.data.email,
                                type: "register",
                            },
                        });
                    },
                });
            }
            if (error.response && error.response.data?.message) {
                throw new Error(
                    error.response.data.message || "Đăng nhập thất bại"
                );
            }
            throw new Error("Không thể kết nối đến máy chủ");
        }
    };
    // Đăng ký
    const Register = async ({
        fullname,
        username,
        email,
        password,
        confirmPassword,
    }) => {
        try {
            const res = await axios.post(`${API}/auth/register`, {
                fullname: fullname,
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
            });
            return res.data.message;
        } catch (error) {
            if (error.response && error.response.data?.message) {
                throw new Error(
                    error.response.data.message || "Đăng ký thất bại"
                );
            } else {
                throw new Error("Không thể kết nối đến máy chủ");
            }
        }
    };
    // Đăng xuất
    const Logout = () => {
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
                setUser,
                Login,
                Register,
                Logout,
                SendOtp,
                ActiveAccount,
                SendNewPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
