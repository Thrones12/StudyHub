import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Breadcrumb.module.scss";

const Breadcrumb = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    let items = [{ label: "Trang chủ" }];
    if (currentPath === "/course") {
        items = [{ label: "Trang chủ", path: "/" }, { label: "Khóa học" }];
    } else if (currentPath === "/exam") {
        items = [{ label: "Trang chủ", path: "/" }, { label: "Kiểm tra" }];
    } else if (currentPath === "/storage") {
        items = [{ label: "Trang chủ", path: "/" }, { label: "Lưu trữ" }];
    } else if (currentPath === "/task") {
        items = [{ label: "Trang chủ", path: "/" }, { label: "Công việc" }];
    } else if (currentPath === "/cskh") {
        items = [
            { label: "Trang chủ", path: "/" },
            { label: "Chăm sóc khách hàng" },
        ];
    } else if (currentPath === "/admin") {
        items = [{ label: "Quản lý người dùng", path: "" }];
    } else if (currentPath.includes("/admin/user/")) {
        items = [
            { label: "Quản lý người dùng", path: "/admin" },
            { label: "Chi tiết" },
        ];
    } else if (currentPath === "/admin/lesson") {
        items = [{ label: "Quản lý bài học", path: "" }];
    } else if (currentPath === "/admin/exam") {
        items = [{ label: "Quản lý bài kiểm tra", path: "" }];
    } else if (currentPath === "/admin/question") {
        items = [{ label: "Quản lý bài tập", path: "" }];
    } else if (currentPath === "/admin/theme") {
        items = [{ label: "Quản lý theme", path: "" }];
    } else if (currentPath === "/admin/sound") {
        items = [{ label: "Quản lý âm thanh", path: "" }];
    } else if (currentPath === "/admin/support") {
        items = [{ label: "Chăm sóc khách hàng", path: "" }];
    }

    return (
        <nav className={styles.breadcrumb}>
            {items.map((item, index) => (
                <span key={index} className={styles.breadcrumbItem}>
                    {item.path ? (
                        <Link to={item.path}>{item.label}</Link>
                    ) : (
                        <span className={styles.current}>{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <span className={styles.separator}>/</span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;
