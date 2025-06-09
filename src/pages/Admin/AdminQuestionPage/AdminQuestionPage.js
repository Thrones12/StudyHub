import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminQuestionPage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import { Avatar, Button, CircularProgress } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { formatQuestionLevel, normalize } from "../../../utils/Helpers";
import axios from "axios";
import Noti from "../../../utils/Noti";

const AdminQuestionPage = () => {
    // Lấy dữ liệu người dùng
    const {
        data: questions,
        loading,
        refetch,
    } = useFetch({
        url: `http://localhost:8080/api/question`,
        method: "GET",
    });
    const [processedQuestions, setProcessedQuestions] = useState([]);
    useEffect(() => {
        if (!questions || questions.length === 0) return;

        setProcessedQuestions(questions);
    }, [questions]);
    // PHÂN TRANG
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [paginatedQuestions, setPaginatedQuestions] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

    useEffect(() => {
        setFilteredQuestions(processedQuestions);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(
            processedQuestions.length / itemsPerPage
        );
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedQuestions(processedQuestions.slice(startIndex, endIndex));
    }, [processedQuestions]);
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedQuestions(filteredQuestions.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredQuestions]);

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
        { label: "Độ khó", value: "level" },
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!questions || questions.length === 0) return;

        // Lọc
        let filtered = [...questions];

        // Sắp xếp
        switch (sortValue) {
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) =>
                    a.content.localeCompare(b.content, "vi", {
                        sensitivity: "base",
                    })
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

        setProcessedQuestions(filtered);
    }, [questions, sortValue]);

    // TÌM KIẾM

    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredQuestions(processedQuestions);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredQuestions(
            processedQuestions.filter((question) => {
                const content = normalize(question?.content) || "";
                const courseTitle = normalize(question?.courseTitle) || "";
                const subjectTitle = normalize(question?.subjectTitle) || "";
                const chapterTitle = normalize(question?.chapterTitle) || "";
                const lessonTitle = normalize(question?.lessonTitle) || "";
                const examTitle = normalize(question?.examTitle) || "";

                const combined = `${content} ${courseTitle} ${subjectTitle} ${chapterTitle} ${lessonTitle} ${examTitle}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedQuestions]);

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
    // Lấy dữ liệu bài học
    const { data: lessons } = useFetch({
        url: `http://localhost:8080/api/lesson`,
        method: "GET",
    });
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedChapterId, setSelectedChapterId] = useState("");
    const [selectedLessonId, setSelectedLessonId] = useState("");
    // Xử lý thay đổi khi chọn mỗi cấp
    const handleCourseChange = (e) => {
        setSelectedCourseId(e.target.value);
        setSelectedSubjectId("");
        setSelectedChapterId("");
        setSelectedLessonId("");
    };
    const handleSubjectChange = (e) => {
        setSelectedSubjectId(e.target.value);
        setSelectedChapterId("");
        setSelectedLessonId("");
    };
    const handleChapterChange = (e) => {
        setSelectedChapterId(e.target.value);
        setSelectedLessonId("");
    };
    const handleLessonChange = (e) => {
        setSelectedLessonId(e.target.value);
    };

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        content: "",
        correctAnswer: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        explanation: "",
        hint: "",
        level: "Easy",
    });
    const onAdd = () => {
        setFormData({
            _id: "",
            content: "",
            correctAnswer: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            explanation: "",
            hint: "",
            level: "Easy",
        });
        setSelectedCourseId("");
        setSelectedSubjectId("");
        setSelectedChapterId("");
        setSelectedLessonId("");
        setShowModal(true);
    };
    const onEdit = (question) => {
        setFormData({
            ...question,
            optionA: question.options[0],
            optionB: question.options[1],
            optionC: question.options[2],
            optionD: question.options[3],
        });

        let courseId =
            courses.find((course) => course.title === question.courseTitle)
                ?._id || "";
        let subjectId =
            subjects.find(
                (subject) =>
                    subject.courseId === courseId &&
                    subject.title === question.subjectTitle
            )?._id || "";
        let chapterId =
            chapters.find(
                (chapter) =>
                    chapter.subjectId === subjectId &&
                    chapter.title === question.chapterTitle
            )?._id || "";
        let lessonId =
            lessons.find(
                (lesson) =>
                    lesson.chapterId._id === chapterId &&
                    lesson.title === question.lessonTitle
            )?._id || "";
        setSelectedCourseId(courseId);
        setSelectedSubjectId(subjectId);
        setSelectedChapterId(chapterId);
        setSelectedLessonId(lessonId);
        setShowModal(true);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Tạo mới
        if (formData._id == "") {
            await axios.post(`http://localhost:8080/api/question`, {
                courseTitle:
                    courses.find((course) => course._id === selectedCourseId)
                        ?.title || "",
                subjectTitle:
                    subjects.find(
                        (subjects) => subjects._id === selectedSubjectId
                    )?.title || "",
                chapterTitle:
                    chapters.find(
                        (chapter) => chapter._id === selectedChapterId
                    )?.title || "",
                lessonTitle:
                    lessons.find((lesson) => lesson._id === selectedLessonId)
                        ?.title || "",
                content: formData.content,
                correctAnswer: formData.correctAnswer,
                options: [
                    formData.optionA,
                    formData.optionB,
                    formData.optionC,
                    formData.optionD,
                ],
                explanation: formData.explanation,
                hint: formData.hint,
                level: formData.level,
            });
            Noti.success("Tạo mới thành công");
        }
        // Cập nhập
        else {
            await axios.put(
                `http://localhost:8080/api/question/${formData._id}`,
                {
                    ...formData,
                    options: [
                        formData.optionA,
                        formData.optionB,
                        formData.optionC,
                        formData.optionD,
                    ],
                    courseTitle:
                        courses.find(
                            (course) => course._id === selectedCourseId
                        )?.title || "",
                    subjectTitle:
                        subjects.find(
                            (subjects) => subjects._id === selectedSubjectId
                        )?.title || "",
                    chapterTitle:
                        chapters.find(
                            (chapter) => chapter._id === selectedChapterId
                        )?.title || "",
                    lessonTitle:
                        lessons.find(
                            (lesson) => lesson._id === selectedLessonId
                        )?.title || "",
                }
            );
            Noti.success("Cập nhập thành công");
        }
        refetch();
        setFormData({
            _id: "",
            examId: "",
            lessonId: "",
            content: "",
            correctAnswer: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            explanation: "",
            hint: "",
            level: "Easy",
        });

        setSelectedCourseId("");
        setSelectedSubjectId("");
        setSelectedChapterId("");
        setSelectedLessonId("");
        setShowModal(false);
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/question/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                content: "",
                correctAnswer: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                explanation: "",
                hint: "",
                level: "Easy",
            });
            setSelectedCourseId("");
            setSelectedSubjectId("");
            setSelectedChapterId("");
            setSelectedLessonId("");
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
                                <th style={{ width: 500 }}>Nội dung</th>
                                <th>Khóa học</th>
                                <th>Môn học</th>
                                <th>Chương</th>
                                <th>Bài học</th>
                                <th>Độ khó</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedQuestions &&
                            paginatedQuestions.length > 0 ? (
                                paginatedQuestions.map((question, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => onEdit(question)}
                                        >
                                            <td
                                                style={{
                                                    maxWidth: "500px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {question.content}
                                            </td>
                                            <td>{question.courseTitle}</td>
                                            <td>{question.subjectTitle}</td>
                                            <td>{question.chapterTitle}</td>
                                            <td>{question.lessonTitle}</td>
                                            <td>
                                                {formatQuestionLevel(
                                                    question.level
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>Không có bài tập nào.</td>
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
                        {/* Lesson */}
                        <div className={styles.Field}>
                            <select
                                value={selectedLessonId}
                                onChange={handleLessonChange}
                            >
                                <option value=''>Chọn bài học</option>
                                {lessons
                                    ?.filter(
                                        (l) =>
                                            l.chapterId._id ===
                                            selectedChapterId
                                    )
                                    .map((lesson) => (
                                        <option
                                            key={lesson._id}
                                            value={lesson._id}
                                        >
                                            {lesson.title}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* content */}
                        <div className={styles.Field}>
                            <textarea
                                name='content'
                                placeholder='Câu hỏi'
                                value={formData.content}
                                onChange={handleChange}
                                required
                                style={{ resize: "vertical" }}
                                rows='5'
                            />
                        </div>
                        {/* correct */}
                        <div className={styles.Field}>
                            <textarea
                                name='correctAnswer'
                                placeholder='Đán án'
                                value={formData.correctAnswer}
                                onChange={handleChange}
                                required
                                style={{ resize: "vertical" }}
                                rows='1'
                            />
                        </div>
                        {/* option */}
                        <div
                            className={styles.Field}
                            style={{ paddingLeft: 10 }}
                        >
                            <p>A</p>
                            <input
                                type='text'
                                name='optionA'
                                placeholder='Lựa chọn 1'
                                value={formData.optionA}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div
                            className={styles.Field}
                            style={{ paddingLeft: 10 }}
                        >
                            <p>B</p>
                            <input
                                type='text'
                                name='optionB'
                                placeholder='Lựa chọn 2'
                                value={formData.optionB}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div
                            className={styles.Field}
                            style={{ paddingLeft: 10 }}
                        >
                            <p>C</p>
                            <input
                                type='text'
                                name='optionC'
                                placeholder='Lựa chọn 3'
                                value={formData.optionC}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div
                            className={styles.Field}
                            style={{ paddingLeft: 10 }}
                        >
                            <p>D</p>
                            <input
                                type='text'
                                name='optionD'
                                placeholder='Lựa chọn 4'
                                value={formData.optionD}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* explanation */}
                        <div className={styles.Field}>
                            <textarea
                                name='explanation'
                                placeholder='Giải thích'
                                value={formData.explanation}
                                onChange={handleChange}
                                style={{ resize: "vertical" }}
                                rows='2'
                            />
                        </div>
                        {/* hint */}
                        <div className={styles.Field}>
                            <textarea
                                name='hint'
                                placeholder='Gợi ý'
                                value={formData.hint}
                                onChange={handleChange}
                                style={{ resize: "vertical" }}
                                rows='2'
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
                                <option value='Easy'>Nhận biết</option>
                                <option value='Medium'>Thông hiểu</option>
                                <option value='Hard'>Vận dụng</option>
                                <option value='Extreme'>Vận dụng cao</option>
                            </select>
                        </div>

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

export default AdminQuestionPage;
