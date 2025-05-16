import React, { useState } from "react";
import styles from "./RegisterPage.module.scss";

export default function RegisterPage() {
    const [form, setForm] = useState({
        lastname: "",
        firstname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }
        setError("");
        // Xử lý đăng ký ở đây (gửi dữ liệu lên server)
        alert("Đăng ký thành công!");
    };

    return (
        <div className={styles.registerPage}>
            <form onSubmit={handleSubmit}>
                <h2>Đăng ký</h2>
                <div style={{ marginBottom: 12 }}>
                    <label>Tên đăng nhập</label>
                    <input
                        type='text'
                        name='username'
                        value={form.username}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Email</label>
                    <input
                        type='email'
                        name='email'
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Mật khẩu</label>
                    <input
                        type='password'
                        name='password'
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Xác nhận mật khẩu</label>
                    <input
                        type='password'
                        name='confirmPassword'
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                {error && (
                    <div style={{ color: "red", marginBottom: 12 }}>
                        {error}
                    </div>
                )}
                <button
                    type='submit'
                    style={{
                        width: "100%",
                        padding: 10,
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                    }}
                >
                    Đăng ký
                </button>
            </form>
        </div>
    );
}
