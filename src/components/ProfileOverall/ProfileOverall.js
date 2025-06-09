import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faEnvelope,
    faPhone,
    faBook,
    faHourglass1,
    faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ProfileOverall.module.scss";
import * as MuiIcons from "@mui/icons-material";

const tabs = [
    { name: "Hồ sơ", key: "profile" },
    { name: "Tiến độ", key: "progress" },
    { name: "Thống kê", key: "statis" },
    // { name: "Lộ trình", key: "learning-path" },
    { name: "Lưu trữ", key: "saves" },
    { name: "Yêu thích", key: "likes" },
];
const ProfileOverall = () => {
    const nav = useNavigate();
    const location = useLocation();
    const pathParts = location.pathname.split("/");
    const activeTab = pathParts[pathParts.length - 1];
    const { user } = useContext(AuthContext);
    const [statis, setStatis] = useState({
        doneLessons: 0,
        totalHours: 0,
        totalExams: 0,
    });
    useEffect(() => {
        if (user) {
            let doneLessons =
                user.learned?.reduce((total, course) => {
                    return (
                        total +
                        course.subjects.reduce((subjectTotal, subject) => {
                            return (
                                subjectTotal +
                                subject.lessons.filter(
                                    (lesson) => lesson.isDone
                                ).length
                            );
                        }, 0)
                    );
                }, 0) || 0;
            let totalSeconds =
                (user.learningHour?.reduce((total, session) => {
                    return (
                        total +
                        session.courses.reduce((courseTotal, course) => {
                            return (
                                courseTotal +
                                course.subjects.reduce(
                                    (subjectTotal, subject) => {
                                        return (
                                            subjectTotal + (subject.second || 0)
                                        );
                                    },
                                    0
                                )
                            );
                        }, 0)
                    );
                }, 0) || 0) +
                (user.sessions?.reduce((sessionTotal, session) => {
                    return sessionTotal + (session.spentTime || 0) * 60; // chuyển phút sang giây
                }, 0) || 0);

            const totalHours = (totalSeconds / 3600).toFixed(2); // Ví dụ: "3.25" giờ
            const totalExams = user.examResults?.length || 0;
            setStatis({
                doneLessons,
                totalHours,
                totalExams,
            });
        }
    }, [user]);
    return (
        <div className={styles.Overall}>
            {user && (
                <div className={styles.Overview}>
                    <div className={styles.Image}>
                        <img src={user.profile.avatarUrl} alt='avatar' />
                    </div>
                    <div className={styles.Profile}>
                        <div className={styles.Username}>
                            {user.profile.fullname}
                        </div>
                        <div className={styles.Info}>
                            <div className={styles.Item}>
                                <MuiIcons.Email />
                                {user.email}
                            </div>
                            <div className={styles.Item}>
                                <MuiIcons.LocationOn />
                                {user.profile.address}
                            </div>
                            <div className={styles.Item}>
                                <MuiIcons.LocalPhone />
                                {user.profile.phone}
                            </div>
                        </div>
                        <div className={styles.Statis}>
                            <div className={styles.Item}>
                                <div className={styles.Number}>
                                    <MuiIcons.MenuBook />
                                    <p>{statis.doneLessons}</p>
                                </div>
                                <div className={styles.Label}>Bài học</div>
                            </div>
                            <div className={styles.Item}>
                                <div className={styles.Number}>
                                    <MuiIcons.Assignment />
                                    <p>{statis.totalExams}</p>
                                </div>
                                <div className={styles.Label}>Bài kiểm tra</div>
                            </div>
                            <div className={styles.Item}>
                                <div className={styles.Number}>
                                    <MuiIcons.HourglassTop />
                                    <p>{statis.totalHours}</p>
                                </div>
                                <div className={styles.Label}>Giờ học</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.Navbar}>
                {tabs.map((tab) => (
                    <li
                        key={tab.key}
                        className={`${styles.Tab} ${
                            activeTab === tab.key ? styles.Active : ""
                        }`}
                        onClick={() => nav(`/account/${tab.key}`)}
                    >
                        {tab.name}
                    </li>
                ))}
            </div>
        </div>
    );
};

export default ProfileOverall;
