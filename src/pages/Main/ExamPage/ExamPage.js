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
import {
    formatExamLevel,
    formatTimeAgo,
    formatDurationToMinute,
    formatCount,
} from "../../../utils/Helpers";
import { Tooltip } from "@mui/material";
import Noti from "../../../utils/Noti";

const ExamPage = () => {
    // State quản lý dữ liệu
    // Bộ lọc và sắp xếp
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
        { label: "Tên từ A-Z", value: "alphabet" },
        { label: "Làm nhiều", value: "attemp" },
        { label: "Lưu nhiều", value: "save" },
        { label: "Độ khó", value: "level" },
    ];
    // State quản lý giá trị đã chọn
    // filterValue: giá trị đã chọn từ bộ lọc
    const [filterValue, setFilterValue] = useState([]);
    // sortValue: giá trị đã chọn từ bộ sắp xếp
    // Mặc định là "best" (Nổi bật)
    // Có thể là "newest", "alphabet", "attemp", "save",
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
    // State quản lý dữ liệu bài kiểm tra đã xử lý
    const [processedExams, setProcessedExams] = useState([]);
    // Khi dữ liệu bài kiểm tra thay đổi, cập nhật processedExams
    useEffect(() => {
        if (!exams || exams.length === 0) return;
        setProcessedExams(exams);
    }, [exams]);
    // PHÂN TRANG
    // Dữ liệu đã lọc và sắp xếp
    const [filteredExams, setFilteredExams] = useState([]);
    // Dữ liệu phân trang
    const [paginatedExams, setPaginatedExams] = useState([]);
    // Trang hiện tại và input đi đến trang
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    // Số lượng bài kiểm tra trên mỗi trang
    const itemsPerPage = 20;
    // Tính toán tổng số trang dựa trên số lượng bài kiểm tra đã lọc
    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    // Khi dữ liệu bài kiểm tra thay đổi, cập nhật danh sách đã lọc và phân trang
    useEffect(() => {
        setFilteredExams(processedExams);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(processedExams.length / itemsPerPage);
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedExams(processedExams.slice(startIndex, endIndex));
    }, [processedExams]);

    // Khi trang thay đổi, cập nhật dữ liệu phân trang
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedExams(filteredExams.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredExams]);

    // Khi nhấn nút phân trang, cập nhật trang hiện tại
    const handleGotoPage = () => {
        const pageNumber = parseInt(gotoPageInput);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
            setGotoPageInput(pageNumber.toFixed(0));
        }
    };
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
                    const scoreA = (a.attemps || 0) + (a.saves || 0);
                    const scoreB = (b.attemps || 0) + (b.saves || 0);
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
                filtered.sort((a, b) => (b.attemps || 0) - (a.attemps || 0));
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

        setProcessedExams(filtered);
    }, [exams, courses, filterValue, sortValue]);

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
                ) : paginatedExams && paginatedExams.length > 0 ? (
                    <>
                        {/* Render each exam */}
                        <div className={styles.ExamList}>
                            {paginatedExams.map((exam, index) => (
                                <ExamCard key={index} exam={exam} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className={styles.pagination}>
                            <button
                                onClick={() =>
                                    setPage((prev) => Math.max(prev - 1, 1))
                                }
                                disabled={page === 1}
                            >
                                Trước
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (p) =>
                                        Math.abs(p - page) <= 2 ||
                                        p === 1 ||
                                        p === totalPages
                                )
                                .map((p, index, arr) => {
                                    // Hiển thị dấu ...
                                    if (index > 0 && p - arr[index - 1] > 1) {
                                        return (
                                            <span
                                                key={`ellipsis-${p}`}
                                                className={styles.ellipsis}
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={p}
                                            className={
                                                p === page
                                                    ? styles.activePage
                                                    : ""
                                            }
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                            <button
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                disabled={page === totalPages}
                            >
                                Sau
                            </button>

                            <div className={styles.gotoPage}>
                                <span>Đi đến:</span>
                                <input
                                    type='number'
                                    value={gotoPageInput}
                                    onChange={(e) =>
                                        setGotoPageInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleGotoPage();
                                    }}
                                    min={1}
                                    max={totalPages}
                                />
                                <button onClick={handleGotoPage}>Đến</button>
                            </div>
                        </div>
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

    // Hàm xử lý khi người dùng click vào bài kiểm tra
    // Kiểm tra xem bài kiểm tra có câu hỏi hay không
    // Nếu không có câu hỏi, hiển thị thông báo
    // Nếu có, điều hướng đến trang làm bài kiểm tra
    function handleNavigate(exam) {
        if (exam.questions.length <= 0) {
            Noti.info("Bài kiểm tra hiện tại chưa có câu hỏi.");
            return;
        }
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
                        <span>{formatDurationToMinute(exam.duration)}</span>
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
                    <Tooltip title='Lượt làm bài'>
                        <div className={styles.flexRow}>
                            <MuiIcons.Assignment />
                            <p>{formatCount(exam.attemps)}</p>
                        </div>
                    </Tooltip>
                    <Tooltip title='Lượt lưu trữ'>
                        <div className={styles.flexRow}>
                            <MuiIcons.BookmarkOutlined />
                            <p>{formatCount(exam.saves)}</p>
                        </div>
                    </Tooltip>
                    <Tooltip title='Đánh giá'>
                        <div className={styles.flexRow}>
                            <MuiIcons.StarOutlined />
                            <p>{exam.rating.overall.toFixed(0)}</p>
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
export default ExamPage;
