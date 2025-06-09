import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./LikeLessonPage.module.scss";
import { User } from "../../../services";
import useFetch from "../../../hooks/useFetch";
import { MainLayoutTools } from "../../../components";
import { useNavigate } from "react-router-dom";
import * as MuiIcons from "@mui/icons-material";
import {
    formatExamLevel,
    formatTimeAgo,
    formatViews,
} from "../../../utils/Helpers";
import { Tooltip } from "@mui/material";
import Noti from "../../../utils/Noti";
const LikeLessonPage = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState([]);
    // Lấy dữ liệu bài học đã hoàn thành
    const { data: learned } = useFetch({
        url: user
            ? `http://localhost:8080/api/user/done?userId=${user._id}`
            : null,
        method: "GET",
        enabled: !!user, // chỉ chạy khi user có dữ liệu
    });
    // Lấy dữ liệu bài học
    const { data: lessons, refetch } = useFetch({
        url: user
            ? `http://localhost:8080/api/user/like?userId=${user._id}`
            : null,
        method: "GET",
        enabled: !!user, // chỉ chạy khi user có dữ liệu
    });
    // Lấy dữ liệu khóa học
    const { data: courses } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    // Xử lí dữ liệu hiển thị
    useEffect(() => {
        if (lessons && lessons.length > 0) {
            setData([...lessons]);
        }
    }, [lessons]);
    // Filter và Sort
    const [filters, setFilters] = useState([]);
    const sortBy = [
        { label: "Mới nhất", value: "newest" },
        { label: "A-Z", value: "alphabet" },
        { label: "Yêu thích", value: "like" },
        { label: "Xem nhiều", value: "view" },
    ];
    const [filterValue, setFilterValue] = useState([]);
    const [sortValue, setSortValue] = useState("newest"); // Thêm giá trị vào bộ lọc
    useEffect(() => {
        let courseFilters = [];
        if (courses) {
            for (let course of courses) {
                courseFilters.push({
                    title: course.title,
                    options: course.subjects.map((subject) => ({
                        label: subject.title,
                        value: subject._id,
                    })),
                });
            }
        }
        if (courseFilters.length > 0) {
            // Đã fetch course và filter chỉ có độ khó
            setFilters([...courseFilters]);
        }
    }, [courses]);
    // Trigger filter
    const onFilter = (filterValue) => {
        setFilterValue(filterValue);
    };
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!lessons || !courses) return;
        let filtered = [];

        // Lấy ra tất cả giá trị level từ filters
        const levelValues =
            filters
                .find((f) => f.title === "Độ khó")
                ?.options.map((opt) => opt.value) || [];

        // Tách filterValue thành 2 loại: subjectId và level
        const subjectIds = filterValue.filter(
            (val) => !levelValues.includes(val)
        );
        const selectedLevels = filterValue.filter((val) =>
            levelValues.includes(val)
        );

        // Lọc
        if (subjectIds.length > 0) {
            for (const course of courses) {
                for (const subject of course.subjects) {
                    if (subjectIds.includes(subject._id)) {
                        for (const chapter of subject.chapters) {
                            if (chapter.lessons?.length > 0) {
                                filtered = [
                                    ...filtered,
                                    ...lessons.filter(
                                        (exam) =>
                                            (chapter.lessons.includes(
                                                exam._id
                                            ) &&
                                                selectedLevels.length === 0) ||
                                            selectedLevels.includes(exam.level)
                                    ),
                                ];
                            }
                        }
                    }
                }
            }
        } else {
            // Không chọn subject, thì lấy toàn bộ lessons gốc
            filtered = lessons.filter(
                (exam) =>
                    selectedLevels.length === 0 ||
                    selectedLevels.includes(exam.level)
            );
        }

        // Sắp xếp
        switch (sortValue) {
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "like":
                filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case "view":
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            default:
                break;
        }
        setData(filtered);
    }, [lessons, courses, filterValue, sortValue, filters]);

    // Xử lý lưu trữ / hủy lưu bài kiểm tra
    const handleDelete = async (e, lessonId) => {
        e.stopPropagation();
        Noti.infoWithYesNo({
            title: "Hủy yêu thích",
            text: "Bạn có chắc chắn muốn hủy yêu thích bài học này không?",
            func: async () => deleteSavedExam({ userId: user._id, lessonId }),
        });
    };

    const deleteSavedExam = async ({ userId, lessonId }) => {
        await User.Like({ userId, lessonId });
        refetch();
    };
    return (
        <div className={styles.Card}>
            <div className={styles.Header}>Bài kiểm tra đã lưu trữ</div>
            {/* Begin: card-body */}
            <div className={styles.Body}>
                {/* Tools */}
                {filters && (
                    <MainLayoutTools
                        filters={filters}
                        onFilter={onFilter}
                        sortBy={sortBy}
                        onSort={onSort}
                        selectFilter={filterValue}
                        selectSort={sortValue}
                        sortWidth={"70px"}
                    />
                )}
                {/* Content */}
                <div className={styles.container}>
                    {data && data.length > 0 ? (
                        <>
                            {/* Render each lesson */}
                            <div className={styles.LessonList}>
                                {data.map((lesson, index) => (
                                    <LessonCard
                                        key={index}
                                        lesson={lesson}
                                        onDelete={handleDelete}
                                        isDone={learned.includes(lesson._id)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noLesson}>
                            <img src='/images/oops.png' alt='images' />
                            <h3>Trống rỗng!</h3>
                            <p>Bạn chưa yêu thích bài học nào.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* End: card-body */}
        </div>
    );
};
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
export default LikeLessonPage;
