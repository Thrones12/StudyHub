import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminExamPage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import { Avatar, Button, CircularProgress } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import {
    formatDurationToMinute,
    formatExamLevel,
    normalize,
} from "../../../utils/Helpers";
import Noti from "../../../utils/Noti";
import axios from "axios";

const AdminExamPage = () => {
    // Lấy dữ liệu bài kiểm tra
    const {
        data: exams,
        loading,
        refetch,
    } = useFetch({
        url: `http://localhost:8080/api/exam`,
        method: "GET",
    });
    const [processedExams, setProcessedExams] = useState([]);
    useEffect(() => {
        if (!exams || exams.length === 0) return;
        setProcessedExams(exams);
    }, [exams]);
    // PHÂN TRANG
    const [filteredExams, setFilteredExams] = useState([]);
    const [paginatedExams, setPaginatedExams] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

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

    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedExams(filteredExams.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredExams]);

    // Khi nhấn Enter hoặc click nút
    const handleGotoPage = () => {
        const pageNumber = parseInt(gotoPageInput);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
            setGotoPageInput(pageNumber.toFixed(0));
        }
    };

    // SẮP XẾP
    const sortBy = [
        { label: "Mới nhất", value: "newest" },
        { label: "A-Z", value: "alphabet" },
        { label: "Câu hỏi", value: "question" },
        { label: "Thời lượng", value: "duration" },
        { label: "Lượt lưu", value: "save" },
        { label: "Lượt làm", value: "attemp" },
        { label: "Đánh giá", value: "rating" },
        { label: "Điểm", value: "score" },
        { label: "Độ khó", value: "level" },
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!exams || exams.length === 0) return;

        // Lọc
        let filtered = [...exams];

        // Sắp xếp
        switch (sortValue) {
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) =>
                    a.title.localeCompare(b.title, "vi", {
                        sensitivity: "base",
                    })
                );
                break;
            case "question":
                filtered.sort(
                    (a, b) =>
                        (b.questions.length || 0) - (a.questions.length || 0)
                );
                break;
            case "duration":
                filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
                break;
            case "save":
                filtered.sort((a, b) => (b.saves || 0) - (a.saves || 0));
                break;
            case "attemp":
                filtered.sort((a, b) => (b.attemps || 0) - (a.attemps || 0));
                break;
            case "rating":
                filtered.sort(
                    (a, b) => (b.rating.overall || 0) - (a.rating.overall || 0)
                );
                break;
            case "score":
                filtered.sort(
                    (a, b) => (b.averageScore || 0) - (a.averageScore || 0)
                );
                break;
            case "level":
                const levelOrder = ["Extreme", "Hard", "Medium", "Easy"];
                filtered.sort(
                    (a, b) =>
                        levelOrder.indexOf(a.level) -
                        levelOrder.indexOf(b.level)
                );
                break;
            default:
                break;
        }

        setProcessedExams(filtered);
    }, [exams, sortValue]);

    // TÌM KIẾM
    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredExams(processedExams);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredExams(
            processedExams.filter((exam) => {
                const title = normalize(exam?.title) || "";
                const courseTitle = normalize(exam?.courseTitle) || "";
                const subjectTitle = normalize(exam?.subjectTitle) || "";
                const author = normalize(exam?.author) || "";

                const combined = `${title} ${courseTitle} ${subjectTitle} ${author}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedExams]);

    // MODAL

    // Lấy dữ liệu khóa học
    const { data: courses } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    // Lấy dữ liệu môn học
    const { data: subjects } = useFetch({
        url: `http://localhost:8080/api/subject`,
        method: "GET",
    });
    // Lấy dữ liệu chương
    const { data: chapters } = useFetch({
        url: `http://localhost:8080/api/chapter`,
        method: "GET",
    });
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedChapterId, setSelectedChapterId] = useState("");
    // Xử lý thay đổi khi chọn mỗi cấp
    const handleCourseChange = (e) => {
        setSelectedCourseId(e.target.value);
        setSelectedSubjectId("");
        setSelectedChapterId("");
    };
    const handleSubjectChange = (e) => {
        setSelectedSubjectId(e.target.value);
        setSelectedChapterId("");
    };
    const handleChapterChange = (e) => {
        setSelectedChapterId(e.target.value);
    };

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        title: "",
        author: "StudyHub",
        duration: "",
        questions: "",
        level: "Easy",
    });
    const onAdd = () => {
        setFormData({
            _id: "",
            title: "",
            author: "StudyHub",
            duration: "",
            questions: "",
            level: "Easy",
        });
        setSelectedCourseId("");
        setSelectedSubjectId("");
        setSelectedChapterId("");
        setShowModal(true);
    };
    const onEdit = (exam) => {
        const questionsString = (exam.questions || []).join("\n");

        setFormData({
            ...exam,
            duration: exam.duration / 60,
            questions: questionsString,
        });

        let chapterId = exam.chapterId;
        setSelectedChapterId(chapterId._id);
        const subjectId =
            subjects.find((s) =>
                s.chapters?.some((c) => c._id === chapterId._id)
            )?._id || "";
        setSelectedSubjectId(subjectId);
        let courseId =
            courses.find((s) => s.subjects?.some((s) => s._id === subjectId))
                ?._id || "";
        setSelectedCourseId(courseId);

        setShowModal(true);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const processedQuestions = formData.questions
            .split("\n")
            .map((q) => q.trim())
            .filter(Boolean); // loại bỏ dòng trống
        // Tạo mới
        if (formData._id == "") {
            await axios.post(`http://localhost:8080/api/exam`, {
                chapterId: selectedChapterId,
                title: formData.title,
                author: formData?.author ?? "StudyHub",
                duration: formData.duration * 60,
                questions: processedQuestions,
                level: formData.level,
            });
            Noti.success("Tạo mới thành công");
        }
        // Cập nhập
        else {
            await axios.put(`http://localhost:8080/api/exam/${formData._id}`, {
                ...formData,
                chapterId: selectedChapterId,
                duration: formData.duration * 60,
                questions: processedQuestions,
            });

            Noti.success("Cập nhập thành công");
        }
        refetch();
        setFormData({
            _id: "",
            chapterId: "",
            title: "",
            author: "StudyHub",
            duration: "",
            questions: "",
            level: "Easy",
        });

        setSelectedCourseId("");
        setSelectedSubjectId("");
        setSelectedChapterId("");
        setShowModal(false);
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/exam/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                chapterId: "",
                title: "",
                author: "StudyHub",
                duration: "",
                questions: "",
                level: "Easy",
            });
            setSelectedCourseId("");
            setSelectedSubjectId("");
            setSelectedChapterId("");
            Noti.success("Xóa thành công");
            setShowModal(false);
        };
        Noti.infoWithYesNo({
            title: "Xóa",
            text: "Xác nhận xóa dữ liệu",
            func: () => onDelete(),
        });
    };
    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <AdminLayoutHeader hasAdd={true} openModalAdd={onAdd} />
            {/* Lọc và sắp xếp */}
            <AdminLayoutTools
                sortBy={sortBy}
                onSort={onSort}
                selectSort={sortValue}
                searchText={searchText}
                onSearch={onSearch}
                sortWidth={"70px"}
            />
            {/* Nội dung */}
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>
                        <CircularProgress />
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Khóa học</th>
                                <th>Môn học</th>
                                <th>Tác giả</th>
                                <th>Điểm trung bình</th>
                                <th>Số câu hỏi</th>
                                <th>Thời lượng</th>
                                <th>Lưu trữ</th>
                                <th>Lượt làm</th>
                                <th>Đánh giá</th>
                                <th>Độ khó</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExams && paginatedExams.length > 0 ? (
                                paginatedExams.map((exam) => {
                                    return (
                                        <tr
                                            key={exam._id}
                                            onClick={() => onEdit(exam)}
                                        >
                                            <td>{exam.title}</td>
                                            <td>{exam.courseTitle}</td>
                                            <td>{exam.subjectTitle}</td>
                                            <td>{exam.author}</td>
                                            <td>{exam.averageScore} / 10</td>
                                            <td>{exam.questions.length} câu</td>
                                            <td>
                                                {formatDurationToMinute(
                                                    exam.duration
                                                )}
                                            </td>
                                            <td>{exam.saves}</td>
                                            <td>{exam.attemps}</td>
                                            <td>{exam.rating.overall} sao</td>
                                            <td>
                                                {formatExamLevel(exam.level)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        Không có bài kiểm tra nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Pagination Controls */}
            <div className={styles.pagination}>
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                                className={p === page ? styles.activePage : ""}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        );
                    })}

                <button
                    onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
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
                        onChange={(e) => setGotoPageInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleGotoPage();
                        }}
                        min={1}
                        max={totalPages}
                    />
                    <button onClick={handleGotoPage}>Đến</button>
                </div>
            </div>
            {/* Modal */}
            <div className={`${styles.Modal} ${showModal ? styles.open : ""}`}>
                <div className={styles.Header}>
                    <p></p>
                    <div
                        className={styles.button}
                        onClick={() => setShowModal(!showModal)}
                    >
                        <MuiIcons.Close />
                    </div>
                </div>
                <div className={styles.Body}>
                    <form onSubmit={handleSubmit} className={styles.Form}>
                        {/* Course */}
                        <div className={styles.Field}>
                            <select
                                value={selectedCourseId}
                                onChange={handleCourseChange}
                                required
                            >
                                <option value=''>Chọn khóa học</option>
                                {courses?.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Subject */}
                        <div className={styles.Field}>
                            <select
                                value={selectedSubjectId}
                                onChange={handleSubjectChange}
                                required
                            >
                                <option value=''>Chọn môn học</option>
                                {subjects
                                    ?.filter(
                                        (s) => s.courseId === selectedCourseId
                                    )
                                    .map((subject) => (
                                        <option
                                            key={subject._id}
                                            value={subject._id}
                                        >
                                            {subject.title}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        {/* Chapter */}
                        <div className={styles.Field}>
                            <select
                                value={selectedChapterId}
                                onChange={handleChapterChange}
                                required
                            >
                                <option value=''>Chọn chương</option>
                                {chapters
                                    ?.filter(
                                        (c) => c.subjectId === selectedSubjectId
                                    )
                                    .map((chapter) => (
                                        <option
                                            key={chapter._id}
                                            value={chapter._id}
                                        >
                                            {chapter.title}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* title */}
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='title'
                                placeholder='Tiêu đề'
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* author */}
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='author'
                                placeholder='Tác giả'
                                value={formData.author}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* duration */}
                        <div className={styles.Field}>
                            <input
                                type='number'
                                name='duration'
                                placeholder='Thời lượng (phút)'
                                value={formData.duration}
                                onChange={handleChange}
                                min='0' // chỉ cho nhập từ 0 trở lên
                                required
                            />
                        </div>
                        {/* level */}
                        <div className={styles.Field}>
                            <select
                                name='level'
                                value={formData.level}
                                onChange={handleChange}
                                required
                            >
                                <option value='Easy'>Dễ</option>
                                <option value='Medium'>Trung bình</option>
                                <option value='Hard'>Khó</option>
                                <option value='Extreme'>Cực khó</option>
                            </select>
                        </div>
                        {/* questions */}
                        <div className={styles.Field}>
                            <textarea
                                name='questions'
                                placeholder='Câu hỏi'
                                style={{ resize: "vertical" }}
                                value={formData.questions}
                                onChange={handleChange}
                                rows='10'
                            />
                        </div>
                        <p style={{ marginTop: -10 }}>
                            * Danh sách id của question ngăn cách nhau bằng cách
                            xuống dòng.
                        </p>
                        <div className={styles.Buttons}>
                            <button type='submit' className={styles.button}>
                                Xác nhận
                            </button>
                            {formData._id !== "" && (
                                <button
                                    type='button'
                                    className={styles.button}
                                    style={{
                                        marginLeft: 15,
                                        backgroundColor: "#ef4444",
                                    }}
                                    onClick={(e) => handleDelete(e)}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminExamPage;
