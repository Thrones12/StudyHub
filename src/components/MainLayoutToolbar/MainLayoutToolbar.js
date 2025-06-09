import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./MainLayoutToolbar.module.scss";
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
} from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { Tooltip } from "@mui/material";
import { normalize } from "../../utils/Helpers";
import * as MuiIcons from "@mui/icons-material";
import useFetch from "../../hooks/useFetch";
import { User } from "../../services";
const navItems = [
    { name: "Home", label: "Trang chủ", icon: faHome, path: "/" },
    {
        name: "Course",
        label: "Khóa học",
        icon: faChalkboardTeacher,
        path: "/course",
    },
    { name: "Exam", label: "Kiểm tra", icon: faClipboard, path: "/exam" },
    {
        name: "Task",
        label: "Lịch học",
        icon: faCalendar,
        path: "/task",
    },
    {
        name: "Space",
        label: "Không gian học",
        icon: faBookOpen,
        path: "/space",
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
const MainLayoutToolbar = ({ isCollapsed, setIsCollapsed }) => {
    const nav = useNavigate();
    const location = useLocation();
    const { user, Logout } = useContext(AuthContext);
    const [selected, setSelected] = useState("Home");
    const [isSearchBoxFocused, setIsSearchBoxFocused] = useState(false);
    // Xử lý tắt modal search
    const modalRef = useRef(null);
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            // Người dùng click bên ngoài ModalSearch
            setIsSearchBoxFocused(false);
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    // State của search
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState("");

    // Lấy dữ liệu bài học
    const { data: lessons } = useFetch({
        url: `http://localhost:8080/api/lesson`,
        method: "GET",
    });
    // Lấy dữ liệu bài kiểm tra
    const { data: exams } = useFetch({
        url: `http://localhost:8080/api/exam`,
        method: "GET",
    });
    // Lấy dữ liệu lịch sử tìm kiếm
    const { data: searchHistories } = useFetch({
        url: user ? `http://localhost:8080/api/user/search/${user._id}` : null,
        method: "GET",
        enabled: !!user, // chỉ chạy khi user có dữ liệu
    });

    // Load icon của navLink được chọn
    useEffect(() => {
        setSelected(getSelectedItem(location.pathname));
    }, [location]);
    // Xử lý chọn item trong navLinks
    const handleSelect = (event, item) => {
        event.preventDefault();
        if (item === "cskh") nav(item);
        else {
            setSelected(item.name);
            nav(item.path);
        }
    };
    // Xử lý tìm kiếm
    useEffect(() => {
        // Chưa fetch data
        if (!lessons || !exams || searchText === "") return;

        const searchWords = normalize(searchText).split(" ");

        let lessonFiltered = lessons.filter((lesson) => {
            const titleWords = normalize(lesson.title).split(" ");
            return searchWords.every((word) =>
                titleWords.some((titleWord) => titleWord.includes(word))
            );
        });
        lessonFiltered = lessonFiltered
            .slice(0, 10)
            .map((item) => ({ ...item, link: `/lesson/${item._id}` }));
        let examFiltered = exams.filter((exam) => {
            const titleWords = normalize(exam.title).split(" ");
            return searchWords.every((word) =>
                titleWords.some((titleWord) => titleWord.includes(word))
            );
        });
        examFiltered = examFiltered
            .slice(0, 10)
            .map((item) => ({ ...item, link: `/exam/${item._id}` }));
        setSearchResults([
            { title: "Bài học", results: [...lessonFiltered] },
            { title: "Bài kiểm tra", results: [...examFiltered] },
        ]);
    }, [lessons, exams, searchText]);
    // Xử lí navigate
    const handleNavigate = async (title, info, link) => {
        const res = await User.AddSearch({
            userId: user._id,
            title,
            info,
            link,
        });
        if (res === true) nav(link);
    };
    return (
        <aside
            className={`${styles.aside} ${isCollapsed ? styles.collapsed : ""}`}
        >
            <div className={styles.user}>
                <div
                    className={styles.userInfo}
                    onClick={() => nav("/account/profile")}
                >
                    <img
                        className={styles.avatar}
                        src={"/avatars/profile.png"}
                        alt='user avatar'
                    />
                    <p className={styles.username}>
                        {user?.name || "Phạm Hùng Phong "}
                    </p>
                </div>

                <Tooltip title={isCollapsed ? "Mở rộng" : "Thu gọn"}>
                    <FontAwesomeIcon
                        icon={faBars}
                        className={styles.hide}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    />
                </Tooltip>
            </div>
            <div ref={modalRef} className={styles.searchBox}>
                <Tooltip title='Tìm kiếm'>
                    <FontAwesomeIcon
                        icon={faSearch}
                        className={styles.hide}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    />
                </Tooltip>
                <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder='Tìm kiếm...'
                    onClick={() => setIsSearchBoxFocused(true)}
                />
                {searchText !== "" && (
                    <MuiIcons.Close
                        onClick={() => {
                            setSearchText("");
                            setIsSearchBoxFocused(true);
                        }}
                    />
                )}
                <div
                    ref={modalRef}
                    className={`${styles.ModalSearch} ${
                        isSearchBoxFocused ? styles.open : ""
                    }`}
                >
                    {searchText === "" ? (
                        <div className={styles.ModalBody}>
                            <div>
                                <div className={styles.Title}>
                                    Lịch sử tìm kiếm
                                </div>
                                <div className={styles.Suggestions}>
                                    {searchHistories &&
                                    searchHistories.length > 0 ? (
                                        searchHistories.map((item, index) => (
                                            <div
                                                key={index}
                                                className={styles.Suggestion}
                                                onClick={() =>
                                                    handleNavigate(
                                                        item.title,
                                                        item.info,
                                                        item.link
                                                    )
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.SuggestTitle
                                                    }
                                                >
                                                    {item.title}
                                                </div>
                                                <div
                                                    className={
                                                        styles.SuggestInfo
                                                    }
                                                >
                                                    {item.info}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.empty}>
                                            Opps! Bạn tiến hành tìm kiếm bao
                                            giờ.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.ModalBody}>
                            {searchResults.map((item, index) => (
                                <div key={index} className={styles.GroupResult}>
                                    <div className={styles.Title}>
                                        {item.title}
                                    </div>
                                    <div className={styles.Results}>
                                        {item.results.length > 0 ? (
                                            item.results.map(
                                                (result, resultIndex) => (
                                                    <div
                                                        key={resultIndex}
                                                        className={
                                                            styles.Result
                                                        }
                                                        onClick={() =>
                                                            handleNavigate(
                                                                result.title,
                                                                `${result.courseTitle} - ${result.subjectTitle}`,
                                                                result.link
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.ResultTitle
                                                            }
                                                        >
                                                            {result.title}
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.ResultInfo
                                                            }
                                                        >
                                                            {`${result.courseTitle} - ${result.subjectTitle}`}
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className={styles.empty}>
                                                Opps! Không có dữ liệu phù hợp.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.horizonline}></div>
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
                    className={selected === "CSKH" ? styles.active : ""}
                    onClick={(e) => handleSelect(e, "cskh")}
                >
                    <Tooltip title='CSKH' placement='right'>
                        <FontAwesomeIcon icon={faQuestionCircle} />
                    </Tooltip>
                    {!isCollapsed && <span>CSKH</span>}
                </Link>

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

export default MainLayoutToolbar;
