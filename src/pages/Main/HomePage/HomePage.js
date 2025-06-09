import React, { useContext, useEffect, useState } from "react";
import styles from "./HomePage.module.scss";
import { MainLayoutHeader } from "../../../components";
import { AuthContext } from "../../../context/AuthContext";
import * as MuiIcons from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons";
import Noti from "../../../utils/Noti";
import useFetch from "../../../hooks/useFetch";
import { Tooltip } from "recharts";
import {
    formatExamLevel,
    formatTimeAgo,
    formatViews,
} from "../../../utils/Helpers";
const MAX_HISTORY = 5;

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const [newHistories, setNewHistories] = useState([]);
    // Lấy dữ liệu bài học
    const { data: lessons, refetch } = useFetch({
        url: `http://localhost:8080/api/lesson`,
        method: "GET",
    });
    // Lấy dữ liệu bài kiểm tra
    const { data: exams } = useFetch({
        url: `http://localhost:8080/api/exam`,
        method: "GET",
    });
    const nav = useNavigate();
    useEffect(() => {
        if (user && lessons && exams) {
            let handledData = [];
            for (let link of user.histories.slice(0, 6)) {
                if (handledData.length >= MAX_HISTORY) break;

                const matchLesson = link.match(
                    /^\/study\/lesson\/([a-fA-F0-9]{24})$/
                );
                const matchExam = link.match(
                    /^\/study\/exam\/([a-fA-F0-9]{24})$/
                );

                if (matchLesson) {
                    const lessonId = matchLesson[1];
                    const lesson = lessons.find((l) => l._id === lessonId);
                    if (lesson) {
                        handledData.push({
                            type: "lesson",
                            data: lesson,
                        });
                    }
                } else if (matchExam) {
                    const examId = matchExam[1];
                    const exam = exams.find((e) => e._id === examId);
                    if (exam) {
                        handledData.push({
                            type: "exam",
                            data: exam,
                        });
                    }
                }
            }
            setNewHistories([...handledData]);
        }
    }, [user, lessons, exams]);
    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <MainLayoutHeader />
            <div className={styles.FlexRow}>
                <div className={styles.FlexColumn} style={{ flex: 3 }}>
                    <div className={styles.Greeting}>
                        {user && (
                            <h2 style={{ top: 100, left: 70 }}>
                                Hi, {user.profile.fullname} 👋
                            </h2>
                        )}
                        <p style={{ top: 160, left: 70 }}>
                            Hôm nay bạn muốn học gì nào?
                        </p>
                        <img src='/images/greeting.png' alt='img' />
                    </div>
                    <div className={styles.GreetingFooter}>
                        <div
                            className={styles.FooterItem}
                            style={{ backgroundColor: "#1b84ff" }}
                            onClick={() => nav("/task")}
                        >
                            <div className={styles.FooterIcon}>
                                <MuiIcons.CalendarMonthOutlined />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Lịch học hôm nay</p>
                                <span
                                    style={{
                                        fontStyle: "italic",
                                        color: "#f1f1f1",
                                    }}
                                >
                                    Đi đến
                                </span>
                            </div>
                        </div>
                        <div
                            className={styles.FooterItem}
                            style={{ backgroundColor: "#faad14" }}
                            onClick={() => nav("/course")}
                        >
                            <div className={styles.FooterIcon}>
                                <FontAwesomeIcon icon={faChalkboardTeacher} />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Khóa học chất lượng</p>
                                <span
                                    style={{
                                        fontStyle: "italic",
                                        color: "#f1f1f1",
                                    }}
                                >
                                    Đi đến
                                </span>
                            </div>
                        </div>
                        <div
                            className={styles.FooterItem}
                            style={{ backgroundColor: "#ef4444" }}
                            onClick={() => {
                                if (user.histories.length === 0) {
                                    Noti.info("Bạn chưa học bài nào.");
                                } else {
                                    nav(user.histories[0]);
                                }
                            }}
                        >
                            <div className={styles.FooterIcon}>
                                <MuiIcons.MenuBookOutlined />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Tiếp học bài học trước</p>
                                <span
                                    style={{
                                        fontStyle: "italic",
                                        color: "#f1f1f1",
                                    }}
                                >
                                    Đi đến
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.FlexColumn} style={{ flex: 1 }}>
                    <div className={styles.Title} style={{ marginTop: 30 }}>
                        Truy cập nhanh
                    </div>
                    <div className={styles.QTAs}>
                        <div
                            className={styles.QTA}
                            onClick={() => nav("/course")}
                        >
                            Danh sách khóa học
                        </div>
                        <div
                            className={styles.QTA}
                            onClick={() => nav("/exam")}
                        >
                            Các bài Kiểm tra
                        </div>
                        <div
                            className={styles.QTA}
                            onClick={() => nav("/task")}
                        >
                            Công việc cá nhân
                        </div>
                        <div
                            className={styles.QTA}
                            onClick={() => nav("/space")}
                        >
                            Không gian học
                        </div>
                        <div
                            className={styles.QTA}
                            onClick={() => nav("/account/progress")}
                        >
                            Tiến độ học tập
                        </div>
                        <div
                            className={styles.QTA}
                            onClick={() => nav("/account/statis")}
                        >
                            Thống kê kết quả học
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.Title}>Hoạt động gần đây</div>
            {newHistories.length > 0 ? (
                <div className={styles.Histories}>
                    {newHistories.map((item, index) => (
                        <div key={index}>
                            {item.type === "lesson" ? (
                                <LessonCard lesson={item.data} />
                            ) : (
                                <ExamCard exam={item.data} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noHistory}>
                    <img src='/images/oops.png' alt='image' />
                    <h3>Chưa có hoạt động nào!</h3>
                </div>
            )}
        </div>
    );
};

export default HomePage;
function LessonCard(props) {
    const nav = useNavigate();
    const { lesson, onDelete, isDone } = props;

    function handleNavigate(lesson) {
        nav(`/study/lesson/${lesson._id}`);
    }
    return (
        <div
            className={styles.LessonCard}
            onClick={() => handleNavigate(lesson)}
        >
            {/* Toggle Delete */}
            <Tooltip title='Hủy yêu thích'>
                <div
                    className={styles.ToggleDelete}
                    onClick={(e) => onDelete(e, lesson._id)}
                >
                    <MuiIcons.Close />
                </div>
            </Tooltip>
            <img src='/avatars/profile.png' alt='image' />
            <div className={styles.title}>{lesson.title}</div>
            <div className={styles.author}>
                {lesson.courseTitle}
                {" - "}
                {lesson.subjectTitle}
            </div>
            <div className={styles.info}>
                <div
                    className={styles.infoItem}
                    style={{
                        flex: 1,
                        color: isDone ? "#34aa36" : "#454e5c",
                        fontWeight: isDone ? "bold" : "normal",
                        fontStyle: "normal",
                    }}
                >
                    <MuiIcons.TaskAlt />
                    <p>{isDone ? "Đã hoàn thành" : "Chưa hoàn thành"}</p>
                </div>
                <div className={styles.infoItem}>
                    <MuiIcons.Favorite />
                    <p>{formatViews(lesson.likes)}</p>
                </div>
                <div className={styles.infoItem}>
                    <MuiIcons.Visibility />
                    <p>{formatViews(lesson.views)}</p>
                </div>
            </div>
        </div>
    );
}
function ExamCard(props) {
    const nav = useNavigate();
    const { exam, onDelete } = props;

    const formatTimeToMinute = (seconds) => {
        const minutes = Math.round(seconds / 60); // dùng round để làm tròn
        return `${minutes} phút`;
    };
    function handleNavigate(exam) {
        nav(`/study/exam/${exam._id}`);
    }
    return (
        <div className={styles.ExamCard} onClick={() => handleNavigate(exam)}>
            {/* Toggle Delete */}
            <Tooltip title='Hủy lưu'>
                <div
                    className={styles.ToggleDelete}
                    onClick={(e) => onDelete(e, exam._id)}
                >
                    <MuiIcons.Close />
                </div>
            </Tooltip>
            {/* Main info */}
            <div
                className={`${styles.MainInfo} ${
                    exam.level === "Easy"
                        ? styles.Easy
                        : exam.level === "Medium"
                        ? styles.Medium
                        : exam.level === "Hard"
                        ? styles.Hard
                        : styles.Extreme
                }`}
            >
                <div className={styles.TitleWrapper}>
                    <div
                        className={styles.Title}
                        style={{ margin: "0 4px 0 0" }}
                    >
                        {exam.title}
                    </div>
                    <div className={styles.SubTitle}>
                        {exam.courseTitle}
                        {" - "}
                        {exam.subjectTitle}
                    </div>
                </div>
                <div className={styles.ExamInfo}>
                    <div className={styles.Info}>
                        <p>Câu hỏi:</p>
                        <span>{exam.questions.length} câu</span>
                    </div>
                    <div className={styles.Info}>
                        <p>Thời gian:</p>
                        <span>{formatTimeToMinute(exam.duration)}</span>
                    </div>
                    <div className={styles.Info}>
                        <p>Mức độ:</p>
                        <span>{formatExamLevel(exam.level)}</span>
                    </div>
                </div>
            </div>
            {/* Sub info */}
            <div className={`${styles.SubInfo} ${styles.FlexRow}`}>
                <div className={`${styles.Info} ${styles.TimeAgo}`}>
                    {formatTimeAgo(exam.createdAt)}
                </div>
                <div className={styles.Info}>
                    <div className={styles.FlexRow}>
                        <MuiIcons.Assignment />
                        <p>{formatViews(exam.attemps)}</p>
                    </div>
                    <div className={styles.FlexRow}>
                        <MuiIcons.BookmarkOutlined />
                        <p>{formatViews(exam.saves)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
