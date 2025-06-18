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
    formatCount,
} from "../../../utils/Helpers";
import { Tooltip } from "@mui/material";
import Noti from "../../../utils/Noti";
const SaveExamPage = () => {
    const { user } = useContext(AuthContext);
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
    // State quản lý bộ lọc và sắp xếp
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
    // State quản lý giá trị đã chọn của bộ lọc và sắp xếp
    // filterValue: chứa các giá trị đã chọn từ bộ lọc
    const [filterValue, setFilterValue] = useState([]);
    // sortValue: chứa giá trị đã chọn từ bộ lọc sắp xếp
    const [sortValue, setSortValue] = useState("best"); // Thêm giá trị vào bộ lọc
    // Khi dữ liệu khóa học thay đổi, cập nhật bộ lọc
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
    // Xóa bài kiểm tra đã lưu
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
                    {paginatedExams && paginatedExams.length > 0 ? (
                        <>
                            {/* Render each exam */}
                            <div className={styles.ExamList}>
                                {paginatedExams.map((exam, index) => (
                                    <ExamCard
                                        key={index}
                                        exam={exam}
                                        onDelete={handleDelete}
                                    />
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

                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                )
                                    .filter(
                                        (p) =>
                                            Math.abs(p - page) <= 2 ||
                                            p === 1 ||
                                            p === totalPages
                                    )
                                    .map((p, index, arr) => {
                                        // Hiển thị dấu ...
                                        if (
                                            index > 0 &&
                                            p - arr[index - 1] > 1
                                        ) {
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
                                            if (e.key === "Enter")
                                                handleGotoPage();
                                        }}
                                        min={1}
                                        max={totalPages}
                                    />
                                    <button onClick={handleGotoPage}>
                                        Đến
                                    </button>
                                </div>
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
// ExamCard Component
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
export default SaveExamPage;
