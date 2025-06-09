import React, { useEffect, useState } from "react";
import {
    MainLayoutHeader,
    MainLayoutTools,
    Pagination,
} from "../../../components";
import styles from "./ExamPage.module.scss";
import useFetch from "../../../hooks/useFetch";
import * as MuiIcons from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { formatExamLevel, formatTimeAgo } from "../../../utils/Helpers";

const ExamPage = () => {
    const [data, setData] = useState([]);
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
    const [quickFilter, setQuickFilter] = useState([]);
    const sortBy = [
        { label: "Nổi bật", value: "best" },
        { label: "Mới nhất", value: "newest" },
        { label: "Theo tên", value: "alphabet" },
        { label: "Làm nhiều", value: "attemp" },
        { label: "Lưu nhiều", value: "save" },
        { label: "Độ khó", value: "level" },
    ];
    const [filterValue, setFilterValue] = useState([]);
    const [sortValue, setSortValue] = useState("best");
    // Lấy dữ liệu khóa học
    const { data: courses, loading } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    // Lấy dữ liệu bài kiểm tra
    const { data: exams } = useFetch({
        url: `http://localhost:8080/api/exam`,
        method: "GET",
    });
    // Xử lí dữ liệu hiển thị
    useEffect(() => {
        if (exams && exams.length > 0) {
            setData([...exams]);
        }
    }, [exams]);
    // Thêm giá trị vào bộ lọc
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
            setQuickFilter([]);
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
    }, [exams, courses, filterValue, sortValue]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <MainLayoutHeader />
            {/* Tools */}
            {filters && (
                <MainLayoutTools
                    filters={filters}
                    quickFilter={quickFilter}
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
                {loading ? (
                    <div>Đang tải dữ liệu...</div>
                ) : data && data.length > 0 ? (
                    <>
                        {/* Render each exam */}
                        <div className={styles.ExamList}>
                            {data.map((exam, index) => (
                                <ExamCard key={index} exam={exam} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {exams && exams.length > 0 && (
                            <Pagination
                                page={currentPage}
                                setPage={setCurrentPage}
                                total={totalPages}
                            />
                        )}
                    </>
                ) : (
                    <div className={styles.noExam}>
                        <img src='/images/oops.png' alt='images' />
                        <h3>Ôi không!</h3>
                        <p>
                            Hiện tại hệ thống không có bài kiểm tra nào phù hợp.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
function ExamCard(props) {
    const nav = useNavigate();
    const { exam } = props;

    const formatTimeToMinute = (seconds) => {
        const minutes = Math.round(seconds / 60); // dùng round để làm tròn
        return `${minutes} phút`;
    };
    function formatCount(number) {
        if (number >= 1_000_000_000) {
            return (
                (number / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ"
            );
        }
        if (number >= 1_000_000) {
            return (number / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Tr";
        }
        if (number >= 1_000) {
            return (number / 1_000).toFixed(1).replace(/\.0$/, "") + " N";
        }
        return number.toString();
    }
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
                        <p>{formatCount(exam.attemps)}</p>
                    </div>
                    <div className={styles.flexRow}>
                        <MuiIcons.BookmarkOutlined />
                        <p>{formatCount(exam.saves)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ExamPage;
