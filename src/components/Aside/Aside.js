import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faChalkboardTeacher,
    faBookmark,
    faCalendar,
    faBookOpen,
    faUsers,
    faClipboard,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import "./Aside.css";

const navItems = [
    { name: "Home", label: "Trang chủ", icon: faHome, path: "/" },
    {
        name: "Course",
        label: "Khóa học",
        icon: faChalkboardTeacher,
        path: "/course",
    },
    { name: "Exam", label: "Kiểm tra", icon: faClipboard, path: "/exam" },
    { name: "Storage", label: "Lưu trữ", icon: faBookmark, path: "/storage" },
    {
        name: "OldCalendar",
        label: "Old Lịch học",
        icon: faCalendar,
        path: "/old-calendar",
    },
    {
        name: "Calendar",
        label: "Lịch học",
        icon: faCalendar,
        path: "/calendar",
    },
    {
        name: "Sound",
        label: "Không gian học",
        icon: faBookOpen,
        path: "/sound-space",
    },
    {
        name: "Group",
        label: "Học cùng nhau",
        icon: faUsers,
        path: "/study-group",
    },
];

const getSelectedItem = (pathname) => {
    for (let item of navItems) {
        if (item.path === "/" && pathname === "/") return item.name;
        if (item.path !== "/" && pathname.startsWith(item.path))
            return item.name;
    }
    return "";
};

const Aside = ({ isOpen }) => {
    const nav = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState("Home");

    useEffect(() => {
        setSelected(getSelectedItem(location.pathname));
    }, [location]);

    const handleSelect = (event, item) => {
        event.preventDefault();
        setSelected(item.name);
        nav(item.path);
    };

    return (
        <div className={`aside ${isOpen ? "active" : ""}`}>
            <div className='link-list'>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={selected === item.name ? "active" : ""}
                        onClick={(e) => handleSelect(e, item)}
                    >
                        <FontAwesomeIcon icon={item.icon} />
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Aside;
