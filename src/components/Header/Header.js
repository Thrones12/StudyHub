import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import constants from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faCaretRight,
    faCaretLeft,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import { ModalNotification, SearchBar } from "../../components";
import { useNavigate } from "react-router-dom";
import { Notification } from "../../services";

const Header = ({ isOpen, handleAside }) => {
    const API = constants.API;
    const nav = useNavigate();
    const { userId, logout } = useContext(AuthContext);
    const [avatar, setAvatar] = useState("");
    const [userOpen, setUserOpen] = useState(false);
    const [notiOpen, setNotiOpen] = useState(false);
    const [reload, setReload] = useState(false);

    const userRef = useRef();
    const notiRef = useRef();

    // Xử lí thông báo mới
    const [newNotiCount, setNewNotiCount] = useState(0);
    useEffect(() => {
        Notification.GetNewNotificationCount(setNewNotiCount);
    }, [API, reload]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${API}/user/get-one?id=${userId}`);
            let data = res.data.data;
            setAvatar(data.avatar);
        };
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const handleClickOutside = (e) => {
        if (userRef.current && !userRef.current.contains(e.target)) {
            setUserOpen(false);
        }
        if (notiRef.current && !notiRef.current.contains(e.target)) {
            setNotiOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNav = (tab) => {
        setUserOpen(!userOpen);
        nav(`/profile/${tab}`);
    };
    return (
        <div className='header-wrapper'>
            {/* Begin: Logo */}
            <div className='logo'>
                <img src='/svgs/logo.svg' onClick={() => nav("/")} />
                {isOpen ? (
                    <FontAwesomeIcon icon={faCaretLeft} onClick={handleAside} />
                ) : (
                    <FontAwesomeIcon
                        icon={faCaretRight}
                        onClick={handleAside}
                    />
                )}
            </div>
            {/* End: Logo */}

            <div className='container'>
                {/* Begin: Search */}
                <div className='search'>
                    <SearchBar />
                </div>
                {/* End: Search */}

                {/* Begin: Tools */}
                <div className='tools'>
                    {/* Begin: ModalNotification */}
                    <div className='dropdown-wrapper' ref={notiRef}>
                        <div
                            className='tool'
                            onClick={() => setNotiOpen(!notiOpen)}
                        >
                            <div className='icon'>
                                <FontAwesomeIcon icon={faBell} />
                                {newNotiCount > 0 && (
                                    <div className='noti-count'>
                                        {newNotiCount}
                                    </div>
                                )}
                            </div>
                        </div>
                        <ModalNotification
                            isOpen={notiOpen}
                            setIsOpen={setNotiOpen}
                            setReload={setReload}
                        />
                    </div>
                    {/* End: ModalNotification */}

                    {/* Begin: User */}
                    <div className='dropdown-wrapper' ref={userRef}>
                        <div
                            className='tool'
                            onClick={() => setUserOpen(!userOpen)}
                        >
                            <div className='image'>
                                <img src={avatar} alt='avatar' />
                            </div>
                        </div>
                        {userOpen && (
                            <div className='dropdown'>
                                <div
                                    className='dropdown-item'
                                    onClick={() => handleNav("account")}
                                >
                                    Hồ sơ
                                </div>
                                <div
                                    className='dropdown-item'
                                    onClick={() => handleNav("statis")}
                                >
                                    Thống kê
                                </div>
                                <div
                                    className='dropdown-item'
                                    onClick={() => handleNav("activities")}
                                >
                                    Hoạt động
                                </div>
                                <div
                                    className='dropdown-item'
                                    onClick={() => logout()}
                                >
                                    Đăng xuất
                                </div>
                            </div>
                        )}
                    </div>
                    {/* End: User */}
                </div>
                {/* End: Tools */}
            </div>
        </div>
    );
};

export default Header;
