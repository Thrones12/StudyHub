import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminLessonPage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import {
    Avatar,
    Button,
    CircularProgress,
    TextareaAutosize,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { normalize } from "../../../utils/Helpers";
import axios from "axios";
import Noti from "../../../utils/Noti";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const AdminLessonPage = () => {
    // Lấy dữ liệu bài học
    const {
        data: lessons,
        loading,
        refetch,
    } = useFetch({
        url: `http://localhost:8080/api/lesson`,
        method: "GET",
    });
    const [processedLessons, setProcessedLessons] = useState([]);
    useEffect(() => {
        if (!lessons || lessons.length === 0) return;
        setProcessedLessons(lessons);
    }, [lessons]);
    // PHÂN TRANG
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [paginatedLessons, setPaginatedLessons] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);

    useEffect(() => {
        setFilteredLessons(processedLessons);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(processedLessons.length / itemsPerPage);
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedLessons(processedLessons.slice(startIndex, endIndex));
    }, [processedLessons]);

    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedLessons(filteredLessons.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredLessons]);

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
        { label: "Bình luận", value: "comment" },
        { label: "Lượt xem", value: "view" },
        { label: "Yêu thích", value: "like" },
        { label: "Đánh giá", value: "rating" },
        { label: "Thứ tự", value: "order" },
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!lessons || lessons.length === 0) return;

        // Lọc
        let filtered = [...lessons];

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
                filtered.sort((a, b) => {
                    const questionsA = countQuestions(a);
                    const questionsB = countQuestions(b);
                    return questionsB - questionsA;
                });
                break;
            case "comment":
                filtered.sort(
                    (a, b) =>
                        (b.comments.length || 0) - (a.comments.length || 0)
                );
                break;
            case "view":
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case "like":
                filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case "rating":
                filtered.sort(
                    (a, b) => (b.rating.overall || 0) - (a.rating.overall || 0)
                );
                break;
            case "order":
                filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
                break;
            default:
                break;
        }

        setProcessedLessons(filtered);
    }, [lessons, sortValue]);
    const countQuestions = (lesson) => {
        if (!lesson?.exercises) return 0;

        return lesson.exercises.reduce((total, ex) => {
            return total + (ex.questions?.length || 0);
        }, 0);
    };
    // TÌM KIẾM
    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredLessons(processedLessons);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredLessons(
            processedLessons.filter((lesson) => {
                const title = normalize(lesson?.title) || "";
                const courseTitle = normalize(lesson?.courseTitle) || "";
                const subjectTitle = normalize(lesson?.subjectTitle) || "";

                const combined = `${title} ${courseTitle} ${subjectTitle}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedLessons]);

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
        document: "",
        videoUrl: "",
        videoChapters: "",
        exercises: "",
        order: 0,
    });
    const onAdd = () => {
        setFormData({
            _id: "",
            title: "",
            document: "",
            videoUrl: "",
            videoChapters: "",
            exercises: "",
            order: 0,
        });
        setSelectedCourseId("");
        setSelectedSubjectId("");
        setSelectedChapterId("");
        setShowModal(true);
    };
    const onEdit = (lesson) => {
        setFormData({
            ...lesson,
            videoUrl: lesson.video.url,
            videoChapters: lesson.video.chapters
                .map((chap) => `${chap.time}: ${chap.title}`)
                .join("\n"),
            exercises: lesson.exercises
                .map(
                    (ex) =>
                        `${ex.type} - ${ex.questions
                            .map((q) => (typeof q === "object" ? q._id : q))
                            .join(", ")}`
                )
                .join("\n"),
        });

        let chapterId = lesson.chapterId;
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
    const uploadVideoToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "ml_default"); // thay bằng preset của bạn
        data.append("cloud_name", "ds5lvyntx"); // thay bằng tên Cloudinary

        try {
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/ds5lvyntx/video/upload",
                data
            );
            return res.data.secure_url;
        } catch (err) {
            console.error("Lỗi upload video:", err);
            return null;
        } finally {
            document.body.style.cursor = "default";
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Chuyển string videoChapters thành object

        const videoChaptersArray =
            formData.videoChapters === ""
                ? []
                : formData.videoChapters
                      .split("\n") // mỗi dòng là "time: title"
                      .map((line) => {
                          const [time, ...titleParts] = line.split(":");
                          return {
                              time: Number(time.trim()),
                              title: titleParts.join(":").trim(),
                          };
                      });
        // Chuyển string exercises thành object
        const exercises = formData.exercises
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line) => {
                const [type, ...rest] = line.split("-");
                return {
                    type: type.trim(),
                    questions: rest
                        .join("-") // đề phòng có dấu - trong type
                        .split(",")
                        .map((id) => id.trim()),
                };
            });

        let videoUrl = formData.videoUrl;

        document.body.style.cursor = "wait";
        // Nếu người dùng chọn file video mới để upload
        if (formData.videoFile) {
            videoUrl = await uploadVideoToCloudinary(formData.videoFile);
            if (!videoUrl) {
                Noti.error("Lỗi upload video lên Cloudinary");
                return;
            }
        }
        // Tạo mới
        if (formData._id == "") {
            await axios.post(`http://localhost:8080/api/lesson`, {
                chapterId: selectedChapterId,
                title: formData.title,
                document: formData.document,
                video: { url: videoUrl, chapters: videoChaptersArray },
                exercises: exercises,
                order: formData.order,
            });
            Noti.success("Tạo mới thành công");
        }
        // Cập nhập
        else {
            await axios.put(
                `http://localhost:8080/api/lesson/${formData._id}`,
                {
                    ...formData,
                    chapterId: selectedChapterId,
                    video: {
                        url: videoUrl,
                        chapters: videoChaptersArray,
                    },
                    exercises: exercises,
                }
            );

            Noti.success("Cập nhập thành công");
        }
        refetch();
        setFormData({
            _id: "",
            title: "",
            document: "",
            videoUrl: "",
            videoChapters: "",
            exercises: "",
            order: 0,
        });

        setSelectedCourseId("");
        setSelectedSubjectId("");
        setSelectedChapterId("");
        document.body.style.cursor = "default";
        setShowModal(false);
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/lesson/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                title: "",
                document: "",
                videoUrl: "",
                videoChapters: "",
                exercises: "",
                order: 0,
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
                                <th>Số câu hỏi</th>
                                <th>Lượt bình luận</th>
                                <th>Lượt xem</th>
                                <th>Lượt yêu thích</th>
                                <th>Đánh giá</th>
                                <th>Thứ tự</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLessons && paginatedLessons.length > 0 ? (
                                paginatedLessons.map((lesson) => {
                                    return (
                                        <tr
                                            key={lesson._id}
                                            onClick={() => onEdit(lesson)}
                                        >
                                            <td>{lesson.title}</td>
                                            <td>{lesson.courseTitle}</td>
                                            <td>{lesson.subjectTitle}</td>
                                            <td>
                                                {countQuestions(lesson)} câu
                                            </td>
                                            <td>
                                                {lesson.comments.length} bình
                                                luận
                                            </td>
                                            <td>{lesson.views}</td>
                                            <td>{lesson.likes}</td>
                                            <td>{lesson.rating.overall} sao</td>
                                            <td>{lesson.order}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>Không có bài học nào.</td>
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
                            <input
                                type='file'
                                accept='video/*'
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        videoFile: e.target.files[0],
                                        videoUrl: URL.createObjectURL(
                                            e.target.files[0]
                                        ),
                                    });
                                }}
                            />
                        </div>
                        {/* videoUrl */}
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='videoUrl'
                                placeholder='Link video'
                                value={formData.videoUrl}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* videoChapters */}
                        <div className={styles.Field}>
                            <textarea
                                name='videoChapters'
                                placeholder='[thời gian]: [tiêu đề]'
                                style={{ resize: "vertical" }}
                                value={formData.videoChapters}
                                onChange={handleChange}
                                rows='5'
                            />
                        </div>
                        {/* exercises */}
                        <div className={styles.Field}>
                            <textarea
                                name='exercises'
                                placeholder='[Dạng bài] - [danh sách id bài tập]'
                                style={{ resize: "vertical" }}
                                value={formData.exercises}
                                onChange={handleChange}
                                rows='5'
                            />
                        </div>
                        <MarkdownEditor
                            value={formData.document}
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    document: val,
                                }))
                            }
                        />
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

export default AdminLessonPage;

const MarkdownEditor = ({ value, onChange }) => {
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef(null);

    const applyMarkdown = (syntax) => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.slice(start, end);

        let wrapped = "";
        switch (syntax) {
            case "bold":
                wrapped = `**${selected || "văn bản in đậm"}**`;
                break;
            case "italic":
                wrapped = `*${selected || "văn bản in nghiêng"}*`;
                break;
            case "image":
                wrapped = `![alt](https://example.com/image.png)`;
                break;
            case "list":
                wrapped = `\\- ${selected || "mục danh sách"}`;
                break;
            case "indent":
                wrapped = `&nbsp;${selected || ""}`;
                break;
            default:
                break;
        }

        const newText = value.slice(0, start) + wrapped + value.slice(end);
        onChange(newText);

        // Đặt lại con trỏ
        setTimeout(() => {
            textarea.setSelectionRange(
                start + wrapped.length,
                start + wrapped.length
            );
            textarea.focus();
        }, 0);
    };
    return (
        <div className={styles.EditorContainer}>
            <div className={styles.Toolbar}>
                <button
                    type='button'
                    onClick={() => setShowPreview(!showPreview)}
                >
                    {showPreview ? "✏️ Soạn thảo" : "👁️ Xem trước"}
                </button>

                {!showPreview ? (
                    <>
                        <button
                            type='button'
                            onClick={() => applyMarkdown("bold")}
                        >
                            🅱️ Đậm
                        </button>
                        <button
                            type='button'
                            onClick={() => applyMarkdown("italic")}
                        >
                            * Nghiêng
                        </button>
                        <button
                            type='button'
                            onClick={() => applyMarkdown("image")}
                        >
                            🖼️ Ảnh
                        </button>
                        <button
                            type='button'
                            onClick={() => applyMarkdown("list")}
                        >
                            • Danh sách
                        </button>
                        <button
                            type='button'
                            onClick={() => applyMarkdown("indent")}
                        >
                            ⏩ Thụt dòng
                        </button>
                    </>
                ) : null}
            </div>

            {!showPreview ? (
                <div className={styles.Field}>
                    <TextareaAutosize
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const updatedValue = rawValue.replace(
                                /([^\n])\n(?!\n)/g,
                                "$1\n\n"
                            );
                            onChange(updatedValue);
                        }}
                        onKeyDown={(e) => {
                            const textarea = textareaRef.current;
                            const cursor = textarea.selectionStart;

                            if (e.key === "Backspace" && cursor >= 2) {
                                const prevTwo = value.slice(cursor - 2, cursor);
                                if (prevTwo === "\n\n") {
                                    e.preventDefault(); // ngăn xoá mặc định
                                    const newValue =
                                        value.slice(0, cursor - 2) +
                                        value.slice(cursor);
                                    onChange(newValue);

                                    // Di chuyển lại con trỏ
                                    setTimeout(() => {
                                        textarea.setSelectionRange(
                                            cursor - 2,
                                            cursor - 2
                                        );
                                    }, 0);
                                }
                            }
                        }}
                        minRows={10}
                        placeholder='Nhập nội dung lý thuyết tại đây (Markdown hỗ trợ công thức, ảnh...)'
                    />
                </div>
            ) : (
                <div className={styles.Field}>
                    <div className={styles.Preview}>
                        <ReactMarkdown
                            children={value}
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
