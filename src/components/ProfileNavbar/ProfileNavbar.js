import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileNavbar.css";

const tabs = [
    { name: "Hồ sơ", key: "account" },
    { name: "Tiến độ", key: "progress" },
    { name: "Thống kê", key: "statis" },
    // { name: "Lộ trình", key: "learning-path" },
    { name: "Hoạt động", key: "activities" },
];

const ProfileNavbar = ({ activeTab }) => {
    const nav = useNavigate();
    return (
        <nav className='profile-navbar'>
            <ul className='navbar-tabs'>
                {tabs.map((tab) => (
                    <li
                        key={tab.key}
                        className={`navbar-tab ${
                            activeTab === tab.key ? "active" : ""
                        }`}
                        onClick={() => nav(`/profile/${tab.key}`)}
                    >
                        {tab.name}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default ProfileNavbar;
