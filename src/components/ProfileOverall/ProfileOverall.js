import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ProfileOverall.module.scss";
import * as MuiIcons from "@mui/icons-material";

const tabs = [
    { name: "Hồ sơ", key: "profile" },
    { name: "Tiến độ", key: "progress" },
    { name: "Thống kê", key: "statis" },
    { name: "Lưu trữ", key: "saves" },
    { name: "Yêu thích", key: "likes" },
];
const ProfileOverall = () => {
    // Sử dụng useNavigate và useLocation để điều hướng và lấy thông tin đường dẫn
    // từ URL hiện tại
    const nav = useNavigate();
    const location = useLocation();
    // Lấy tên tab hiện tại từ đường dẫn URL
    // Ví dụ: nếu đường dẫn là "/account/profile", thì activeTab sẽ là "profile"
    // Nếu đường dẫn là "/account/progress", thì activeTab sẽ là "progress"
    const pathParts = location.pathname.split("/");
    const activeTab = pathParts[pathParts.length - 1];
    const { user } = useContext(AuthContext);
    // Khởi tạo state để lưu trữ thông tin thống kê
    // bao gồm số bài học đã hoàn thành, tổng số giờ học và tổng số bài
    const [statis, setStatis] = useState({
        doneLessons: 0,
        totalHours: 0,
        totalExams: 0,
    });
    // Sử dụng useEffect để cập nhật thông tin thống kê khi người dùng thay đổi
    // hoặc khi các thông tin liên quan đến người dùng thay đổi
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
                            {user?.email && (
                                <div className={styles.Item}>
                                    <MuiIcons.Email />
                                    {user.email}
                                </div>
                            )}
                            {user.profile?.address && (
                                <div className={styles.Item}>
                                    <MuiIcons.LocationOn />
                                    {user.profile.address}
                                </div>
                            )}
                            {user.profile?.phone && (
                                <div className={styles.Item}>
                                    <MuiIcons.LocalPhone />
                                    {user.profile.phone}
                                </div>
                            )}
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
