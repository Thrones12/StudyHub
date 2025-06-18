import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./LikeLessonPage.module.scss";
import { User } from "../../../services";
import useFetch from "../../../hooks/useFetch";
import { MainLayoutTools } from "../../../components";
import { useNavigate } from "react-router-dom";
import * as MuiIcons from "@mui/icons-material";
import {
    formatlessonLevel,
    formatTimeAgo,
    formatCount,
} from "../../../utils/Helpers";
import { Tooltip } from "@mui/material";
import Noti from "../../../utils/Noti";
const LikeLessonPage = () => {
    const { user } = useContext(AuthContext);
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
    // State quản lý dữ liệu bài kiểm tra đã xử lý
    const [processedLessons, setProcessedLessons] = useState([]);
    // Khi dữ liệu bài kiểm tra thay đổi, cập nhật processedLessons
    useEffect(() => {
        if (!lessons || lessons.length === 0) return;
        setProcessedLessons(lessons);
    }, [lessons]);
    // PHÂN TRANG
    // Dữ liệu đã lọc và sắp xếp
    const [filteredLessons, setFilteredLessons] = useState([]);
    // Dữ liệu phân trang
    const [paginatedLessons, setPaginatedLessons] = useState([]);
    // Trang hiện tại và input đi đến trang
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    // Số lượng bài kiểm tra trên mỗi trang
    const itemsPerPage = 20;
    // Tính toán tổng số trang dựa trên số lượng bài kiểm tra đã lọc
    const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);

    // Khi dữ liệu bài kiểm tra thay đổi, cập nhật danh sách đã lọc và phân trang
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

    // Khi trang thay đổi, cập nhật dữ liệu phân trang
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedLessons(filteredLessons.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredLessons]);

    // Khi nhấn nút phân trang, cập nhật trang hiện tại
    const handleGotoPage = () => {
        const pageNumber = parseInt(gotoPageInput);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
            setGotoPageInput(pageNumber.toFixed(0));
        }
    };
    // Filter và Sort
    const [filters, setFilters] = useState([]);
    const sortBy = [
        { label: "Mới nhất", value: "newest" },
        { label: "A-Z", value: "alphabet" },
        { label: "Yêu thích", value: "like" },
        { label: "Xem nhiều", value: "view" },
    ];
    // State để lưu trữ giá trị filter và sort
    // filterValue: Lưu trữ các giá trị đã chọn trong bộ lọc
    const [filterValue, setFilterValue] = useState([]);
    // sortValue: Lưu trữ giá trị đã chọn trong bộ lọc sắp xếp
    // Mặc định là "newest" (mới nhất)
    const [sortValue, setSortValue] = useState("newest"); // Thêm giá trị vào bộ lọc
    // Lấy dữ liệu khóa học và tạo bộ lọc
    // Chỉ lấy các khóa học đã được fetch và có subjects
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
                                        (lesson) =>
                                            (chapter.lessons.includes(
                                                lesson._id
                                            ) &&
                                                selectedLevels.length === 0) ||
                                            selectedLevels.includes(
                                                lesson.level
                                            )
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
                (lesson) =>
                    selectedLevels.length === 0 ||
                    selectedLevels.includes(lesson.level)
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
        setProcessedLessons(filtered);
    }, [lessons, courses, filterValue, sortValue, filters]);

    // Xử lý lưu trữ / hủy lưu bài kiểm tra
    const handleDelete = async (e, lessonId) => {
        e.stopPropagation();
        Noti.infoWithYesNo({
            title: "Hủy yêu thích",
            text: "Bạn có chắc chắn muốn hủy yêu thích bài học này không?",
            func: async () => deleteLikedLesson({ userId: user._id, lessonId }),
        });
    };
    // Hàm xóa bài học đã yêu thích
    // Gọi API để hủy yêu thích bài học
    const deleteLikedLesson = async ({ userId, lessonId }) => {
        await User.Like({ userId, lessonId });
        refetch();
    };
    return (
        <div className={styles.Card}>
            <div className={styles.Header}>Bài học đã yêu thích</div>
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
                    {paginatedLessons && paginatedLessons.length > 0 ? (
                        <>
                            {/* Render each lesson */}
                            <div className={styles.LessonList}>
                                {paginatedLessons.map((lesson, index) => (
                                    <LessonCard
                                        key={index}
                                        lesson={lesson}
                                        onDelete={handleDelete}
                                        isDone={learned.includes(lesson._id)}
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
            {/* Toggle Delete */}
            <Tooltip title='Hủy yêu thích'>
                <div
                    className={styles.ToggleDelete}
                    onClick={(e) => onDelete(e, lesson._id)}
                >
                    <MuiIcons.Close />
                </div>
            </Tooltip>
            {lesson.video && (
                <VideoThumbnail
                    videoUrl={lesson.video.url}
                    alt='Thumbnail'
                    style={{ width: "100%" }}
                />
            )}
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
// Thumbnail component for video trong lesson cards
const VideoThumbnail = ({ videoUrl, fallbackUrl, ...props }) => {
    const [thumbnail, setThumbnail] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

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

export default LikeLessonPage;
