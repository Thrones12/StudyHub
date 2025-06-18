import React, { useContext, useEffect, useRef, useState } from "react";
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
    formatCount,
} from "../../../utils/Helpers";
import dayjs from "dayjs";
import axios from "axios";
const MAX_HISTORY = 5;

const HomePage = () => {
    const nav = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const [newHistories, setNewHistories] = useState([]);
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
    // Xử lý dữ liệu lịch sử học tập
    // Chỉ lấy 6 hoạt động gần đây nhất
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

    // Xử lý thông báo nhắc nhở công việc mỗi khi người dùng mở trang chủ
    useEffect(() => {
        const reminderUser = async () => {
            await axios
                .post(
                    `http://localhost:8080/api/notification/reminder?userId=${user._id}`
                )
                .then((res) => {
                    if (res.data.user) {
                        setUser(res.data.user);
                    }
                })
                .catch((err) => {
                    console.error("Lỗi khi tạo reminder:", err);
                });
        };
        if (user && user.notifications) {
            const today = dayjs().startOf("day");

            const hasReminderToday = user.notifications.some((noti) => {
                return (
                    noti.type === "Reminder" &&
                    dayjs(noti.createdAt).isSame(today, "day")
                );
            });

            if (!hasReminderToday) {
                // Gọi API tạo thông báo Reminder mới
                reminderUser();
            }
        }
    }, [user]);
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

// Thẻ bài học
function LessonCard(props) {
    const nav = useNavigate();
    const { lesson } = props;

    // Hàm xử lý điều hướng đến trang bài học
    // Khi người dùng click vào bài học, sẽ điều hướng đến trang chi tiết bài học
    function handleNavigate(lesson) {
        nav(`/study/lesson/${lesson._id}`);
    }
    return (
        <div
            className={styles.LessonCard}
            onClick={() => handleNavigate(lesson)}
        >
            <VideoThumbnail
                videoUrl={lesson.video.url}
                alt='Thumbnail'
                style={{ width: "100%" }}
            />
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
                        color: "#454e5c",
                        fontStyle: "normal",
                    }}
                ></div>
                <div className={styles.infoItem}>
                    <MuiIcons.Favorite />
                    <p>{formatCount(lesson.likes)}</p>
                </div>
                <div className={styles.infoItem}>
                    <MuiIcons.Visibility />
                    <p>{formatCount(lesson.views)}</p>
                </div>
            </div>
        </div>
    );
}
// Thẻ bài kiểm tra
function ExamCard(props) {
    const nav = useNavigate();
    const { exam } = props;

    const formatTimeToMinute = (seconds) => {
        const minutes = Math.round(seconds / 60);
        return `${minutes} phút`;
    };
    function handleNavigate(exam) {
        nav(`/study/exam/${exam._id}`);
    }
    return (
        <div className={styles.ExamCard} onClick={() => handleNavigate(exam)}>
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
                        <p>{formatCount(exam.attemps)}</p>
                    </div>
                    <div className={styles.FlexRow}>
                        <MuiIcons.BookmarkOutlined />
                        <p>{formatCount(exam.saves)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
// Thumbnail component for video trong lesson cards
const VideoThumbnail = ({ videoUrl, fallbackUrl, ...props }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        const capture = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setThumbnail(canvas.toDataURL("image/jpeg"));
        };

        video.currentTime = 1;
        video.addEventListener("loadeddata", capture);
        return () => video.removeEventListener("loadeddata", capture);
    }, [videoUrl]);

    return (
        <>
            {thumbnail ? (
                <img src={thumbnail} alt='Video thumbnail' {...props} />
            ) : (
                <>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        crossOrigin='anonymous'
                        style={{ display: "none" }}
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <img src={fallbackUrl} alt='Fallback' {...props} />
                </>
            )}
        </>
    );
};
