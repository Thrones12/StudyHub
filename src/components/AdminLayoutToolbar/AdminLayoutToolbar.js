import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./AdminLayoutToolbar.module.scss";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faChalkboardTeacher,
    faCalendar,
    faBookOpen,
    faClipboard,
    faSearch,
    faGear,
    faRightFromBracket,
    faBars,
    faRocket,
    faBell,
    faLifeRing,
    faImage,
    faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { Tooltip } from "@mui/material";
import { normalize } from "../../utils/Helpers";
import * as MuiIcons from "@mui/icons-material";
import useFetch from "../../hooks/useFetch";
import { User } from "../../services";
const navItems = [
    { name: "User", label: "Người dùng", icon: faHome, path: "/admin" },
    {
        name: "Lesson",
        label: "Bài học",
        icon: faChalkboardTeacher,
        path: "/admin/lesson",
    },
    {
        name: "Exam",
        label: "Bài kiểm tra",
        icon: faClipboard,
        path: "/admin/exam",
    },
    {
        name: "Question",
        label: "Bài tập",
        icon: faQuestionCircle,
        path: "/admin/question",
    },
    {
        name: "Theme",
        label: "Theme",
        icon: faImage,
        path: "/admin/theme",
    },
    {
        name: "Sound",
        label: "Âm thanh",
        icon: faVolumeHigh,
        path: "/admin/sound",
    },
    {
        name: "Support",
        label: "Hỗ trợ",
        icon: faLifeRing,
        path: "/admin/support",
    },
];
const AdminLayoutToolbar = ({ isCollapsed, setIsCollapsed }) => {
    const nav = useNavigate();
    const location = useLocation();
    const { Logout } = useContext(AuthContext);
    const [selected, setSelected] = useState("Home");

    // Load icon của navLink được chọn
    useEffect(() => {
        const currentPath = location.pathname;
        const matched = navItems.find((item) =>
            item.path === "/admin"
                ? currentPath === "/admin"
                : currentPath.startsWith(item.path)
        );
        if (matched) {
            setSelected(matched.name);
        }
    }, [location.pathname]);
    // Xử lý chọn item trong navLinks
    const handleSelect = (event, item) => {
        event.preventDefault();

        nav(item.path);
    };
    return (
        <aside
            className={`${styles.aside} ${isCollapsed ? styles.collapsed : ""}`}
        >
            <div className={styles.user}>
                <div className={styles.userInfo}>
                    <p className={styles.username}>{"Trang quản trị"}</p>
                </div>

                <Tooltip title={isCollapsed ? "Mở rộng" : "Thu gọn"}>
                    <FontAwesomeIcon
                        icon={faBars}
                        className={styles.hide}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    />
                </Tooltip>
            </div>
            <nav className={styles.navLinks}>
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        className={selected === item.name ? styles.active : ""}
                        onClick={(e) => handleSelect(e, item)}
                    >
                        <Tooltip title={item.label} placement='right'>
                            <FontAwesomeIcon icon={item.icon} />
                        </Tooltip>
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>
            <div className={`${styles.footer} ${styles.navLinks}`}>
                <Link
                    className={selected === "Logout" ? styles.active : ""}
                    onClick={Logout}
                >
                    <Tooltip title='Đăng xuất' placement='right'>
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </Tooltip>
                    {!isCollapsed && <span>Đăng xuất</span>}
                </Link>
            </div>
        </aside>
    );
};

export default AdminLayoutToolbar;
