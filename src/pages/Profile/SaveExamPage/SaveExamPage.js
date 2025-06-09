import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./SaveExamPage.module.scss";
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
const SaveExamPage = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState([]);
    // Lấy dữ liệu bài kiểm tra
    const { data: exams, refetch } = useFetch({
        url: user
            ? `http://localhost:8080/api/user/save?userId=${user._id}`
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
        if (exams && exams.length > 0) {
            setData([...exams]);
        }
    }, [exams]);
    // Filter và Sort
    const [filters, setFilters] = useState([
        {
            title: "Độ khó",
            options: [
                { label: "Nhận biết", value: "Easy" },
                { label: "Thông hiểu", value: "Medium" },
                { label: "Vận dụng", value: "Hard" },
                { label: "Vận dụng cao", value: "Extreme" },
            ],
        },
    ]);
    const sortBy = [
        { label: "Nổi bật", value: "best" },
        { label: "Mới nhất", value: "newest" },
        { label: "Theo tên", value: "alphabet" },
        { label: "Làm nhiều", value: "attemp" },
        { label: "Lưu nhiều", value: "save" },
        { label: "Độ khó", value: "level" },
    ];
    const [filterValue, setFilterValue] = useState([]);
    const [sortValue, setSortValue] = useState("best"); // Thêm giá trị vào bộ lọc
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
        if (courseFilters.length > 0 && filters.length === 1) {
            // Đã fetch course và filter chỉ có độ khó
            setFilters([...courseFilters, ...filters]);
        }
    }, [filters, courses]);
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
        if (!exams || !courses) return;
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
                            if (chapter.exams?.length > 0) {
                                filtered = [
                                    ...filtered,
                                    ...exams.filter(
                                        (exam) =>
                                            (chapter.exams.includes(exam._id) &&
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
            // Không chọn subject, thì lấy toàn bộ exams gốc
            filtered = exams.filter(
                (exam) =>
                    selectedLevels.length === 0 ||
                    selectedLevels.includes(exam.level)
            );
        }
        // Sắp xếp
        switch (sortValue) {
            case "best":
                filtered.sort((a, b) => {
                    const scoreA = (a.attempts || 0) + (a.saves || 0);
                    const scoreB = (b.attempts || 0) + (b.saves || 0);
                    if (scoreB === scoreA) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return scoreB - scoreA;
                });
                break;
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "attemp":
                filtered.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
                break;
            case "save":
                filtered.sort((a, b) => (b.saves || 0) - (a.saves || 0));
                break;
            case "level":
                const levelOrder = {
                    Easy: 1,
                    Medium: 2,
                    Hard: 3,
                    Extreme: 4,
                };
                filtered.sort((a, b) => {
                    return (
                        (levelOrder[a.level] || 999) -
                        (levelOrder[b.level] || 999)
                    );
                });
                break;
            default:
                break;
        }

        setData(filtered);
    }, [exams, courses, filterValue, sortValue, filters]);

    // Xử lý lưu trữ / hủy lưu bài kiểm tra
    const handleDelete = async (e, examId) => {
        e.stopPropagation();
        Noti.infoWithYesNo({
            title: "Hủy lưu trữ",
            text: "Bạn có chắc chắn muốn hủy lưu bài kiểm tra này không?",
            func: async () => deleteSavedExam({ userId: user._id, examId }),
        });
    };

    const deleteSavedExam = async ({ userId, examId }) => {
        await User.Save({ userId, examId });
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
                            {/* Render each exam */}
                            <div className={styles.ExamList}>
                                {data.map((exam, index) => (
                                    <ExamCard
                                        key={index}
                                        exam={exam}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noExam}>
                            <img src='/images/oops.png' alt='images' />
                            <h3>Trống rỗng!</h3>
                            <p>Bạn chưa lưu trữ bài kiểm tra nào.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* End: card-body */}
        </div>
    );
};
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
                    <div className={styles.Title}>{exam.title}</div>
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
            <div className={`${styles.SubInfo} ${styles.flexRow}`}>
                <div className={`${styles.Info} ${styles.TimeAgo}`}>
                    {formatTimeAgo(exam.createdAt)}
                </div>
                <div className={styles.Info}>
                    <div className={styles.flexRow}>
                        <MuiIcons.Assignment />
                        <p>{formatViews(exam.attemps)}</p>
                    </div>
                    <div className={styles.flexRow}>
                        <MuiIcons.BookmarkOutlined />
                        <p>{formatViews(exam.saves)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SaveExamPage;
