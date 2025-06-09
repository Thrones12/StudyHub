import React, { useContext, useEffect, useRef, useState } from "react";
import useFetch from "../../../hooks/useFetch";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./LessonStudyPage.module.scss";
import { Support, User } from "../../../services";
import Noti from "../../../utils/Noti";
import { formatQuestionLevel, formatTimeAgo } from "../../../utils/Helpers";
import { Tooltip } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { formatTimer } from "../../../utils/Helpers";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // style cho công thức toán học
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";

const LessonStudyPage = () => {
    const nav = useNavigate();
    const { lessonId } = useParams();
    const { user, setUser } = useContext(AuthContext);
    const [activeStep, setActiveStep] = useState(0);
    const [isDoneVideo, setIsDoneVideo] = useState(false);
    const [isDoneExercise, setIsDoneExercise] = useState(false);
    const [isShowReportModal, setIsShowReportModal] = useState(false);
    const [isShowNavigationBar, setIsShowNavigationBar] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [questions, setQuestions] = useState();
    const [inputs, setInputs] = useState();
    const [showHints, setShowHints] = useState([]);
    const [showExplanations, setShowExplanations] = useState([]);
    const inputsRefs = useRef([]);
    // Đếm giờ học
    const [subjectId, setSubjectId] = useState(null);
    // Lấy subjectId để hỗ trợ thêm giờ học vào user
    const { data: subjects } = useFetch({
        url: `http://localhost:8080/api/subject`,
        method: "GET",
    });
    useEffect(() => {
        if (subjects) {
            for (const subject of subjects) {
                for (const chapter of subject.chapters || []) {
                    const found = chapter.lessons.find(
                        (lesson) => lesson._id === lessonId
                    );
                    if (found) {
                        setSubjectId(subject._id);
                    }
                }
            }
        }
    }, [subjects, lessonId]);
    const enterTimeRef = useRef(null);
    useEffect(() => {
        // Ghi lại thời điểm truy cập vào trang
        enterTimeRef.current = Date.now();

        // Khi rời khỏi trang (component bị unmount)
        return async () => {
            const exitTime = Date.now();
            const secondsSpent = Math.floor(
                (exitTime - enterTimeRef.current) / 1000
            );
            if (secondsSpent > 0 && user && subjectId) {
                console.log(secondsSpent);
                await axios.put("http://localhost:8080/api/user/log-time", {
                    userId: user._id,
                    subjectId: subjectId,
                    second: secondsSpent,
                });
            }
        };
    }, [user, subjectId]);
    // Xử lý thêm history và update view của lesson
    useEffect(() => {
        async function postView(userId, link, lessonId) {
            try {
                const res = await axios.post(
                    "http://localhost:8080/api/user/history",
                    {
                        userId,
                        link,
                        lessonId,
                    }
                );
                // So sánh mảng histories
                const newHistories = res.data.histories;
                const oldHistories = user.histories;

                const areHistoriesDifferent =
                    oldHistories.length !== newHistories.length ||
                    oldHistories.some((h, i) => h !== newHistories[i]);

                if (areHistoriesDifferent) {
                    setUser(res.data);
                }
            } catch (err) {}
        }
        if (user && lessonId) {
            postView(user._id, `/study/lesson/${lessonId}`, lessonId);
        }
    }, [lessonId, user]);
    // Lấy dữ liệu bài học
    const { data: lesson } = useFetch({
        url: `http://localhost:8080/api/lesson/${lessonId}`,
        method: "GET",
        deps: [lessonId],
    });
    // Lấy dữ liệu bình luận
    const { data: comments, refetch: refetchComment } = useFetch({
        url: `http://localhost:8080/api/comment?lessonId=${lessonId}`,
        method: "GET",
        deps: [lessonId],
    });
    // Scroll on top mỗi khi đổi step
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [activeStep]);
    // Xử lý state đầu vào
    useEffect(() => {
        if (lesson) {
            const flatQuestions = lesson.exercises.flatMap((ex) => {
                return ex.questions.map((q) => ({
                    ...q,
                    type: ex.type,
                }));
            });
            setQuestions(flatQuestions);
            setInputs(
                flatQuestions.map((q) => ({
                    question: q,
                    input: "",
                    state: "not_done",
                }))
            );
            setIsDoneVideo(false);
            setIsDoneExercise(false);
        }
    }, [lesson]);
    // Quản lý state liked
    useEffect(() => {
        if (lesson && user) {
            setIsLiked(user.likes.find((item) => item === lesson._id));
        }
    }, [lesson, user]);
    // Khi người dùng done bài giảng và bài tập
    useEffect(() => {
        const putLessonIntoUserLearned = async (userId, lessonId) => {
            try {
                const res = await axios.put(
                    `http://localhost:8080/api/user/learned`,
                    {
                        userId,
                        lessonId,
                    }
                );
                setUser(res.data);
                Noti.success("Bạn đã hoàn thành bài học");
            } catch (err) {
                if (err.response?.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Lỗi hệ thống");
                }
            }
        };

        if (user?._id && lessonId) {
            if (isDoneVideo && isDoneExercise) {
                putLessonIntoUserLearned(user._id, lessonId);
            } else if (isDoneVideo) {
                if (isDoneVideo && !isDoneExercise) {
                    setActiveStep(1);
                }
            }
        }
    }, [isDoneVideo, isDoneExercise, user?._id, lessonId, inputs, setUser]);
    // Kiểm tra người dùng đã hoàn thành tất cả bài tập chưa
    useEffect(() => {
        if (inputs && inputs.every((input) => input.state === "true")) {
            setIsDoneExercise(true);
        }
    }, [inputs]);
    // Xử lý yêu thích / hủy yêu thích bài học
    const handleLike = async () => {
        let res = await User.Like({ userId: user._id, lessonId: lesson._id });
        setUser(res.user);
    };
    // Chuyển trang messager khi click Hỗ trợ
    const handleNavigateSupport = () => {
        window.open(
            "https://m.me/61560673299548",
            "_blank",
            "noopener,noreferrer"
        );
    };
    // Xử lý khi người dùng chọn đáp án
    const hanldeCheck = (questionIndex, option) => {
        setInputs(
            inputs.map((q, i) =>
                i === questionIndex
                    ? {
                          question: q.question,
                          input: option,
                          state:
                              q.question.correctAnswer === option
                                  ? "true"
                                  : "false",
                      }
                    : q
            )
        );
    };
    // Xử lý hiển thị gợi ý
    const handleShowHint = (index) => {
        let temp = showHints;
        temp[index] = !temp[index];
        setShowHints([...temp]);
    };
    // Xử lý hiển thị đáp án
    const handleShowExplanation = (index) => {
        let temp = showExplanations;
        temp[index] = !temp[index];
        setShowExplanations([...temp]);
    };
    return (
        <div className={styles.Wrapper}>
            {user && lesson && (
                <>
                    <div className={styles.Header}>
                        {/* Back */}
                        <Tooltip title='Quay lại'>
                            <div
                                className={`${styles.AbsolutePosition} ${styles.Button}`}
                                style={{
                                    top: "15px",
                                    left: "15px",
                                    cursor: "pointer",
                                }}
                                onClick={() => nav("/course")}
                            >
                                <MuiIcons.KeyboardBackspaceOutlined
                                    className={styles.Icon}
                                />
                            </div>
                        </Tooltip>
                        <div className={styles.Stepper}>
                            {/* Step 1 */}
                            <div
                                className={`${styles.Step}  ${
                                    isDoneVideo === true ? styles.done : ""
                                }`}
                                onClick={() => setActiveStep(0)}
                            >
                                <div className={styles.Circle}>
                                    {isDoneVideo ? <MuiIcons.Check /> : 1}
                                </div>
                                <div className={styles.Label}>Bài giảng</div>
                            </div>
                            {/* Horizontal */}
                            <div
                                className={`${styles.HorizontalLine} ${
                                    (activeStep === 1 &&
                                        isDoneVideo === true) ||
                                    (isDoneVideo === true &&
                                        isDoneExercise === true)
                                        ? styles.active
                                        : ""
                                }`}
                            />
                            {/* Step 2 */}
                            <div
                                className={`${styles.Step} ${
                                    activeStep === 1 ? styles.active : ""
                                } ${
                                    isDoneExercise === true ? styles.done : ""
                                }`}
                                onClick={() => setActiveStep(1)}
                            >
                                <div className={styles.Circle}>
                                    {isDoneExercise ? <MuiIcons.Check /> : 2}
                                </div>
                                <div className={styles.Label}>Bài tập</div>
                            </div>
                        </div>
                        {/* Hỗ trợ */}
                        <Tooltip title='Liên hệ qua messager'>
                            <div
                                className={`${styles.AbsolutePosition} ${styles.Button}`}
                                style={{
                                    top: "15px",
                                    right: "140px",
                                    cursor: "pointer",
                                }}
                                onClick={handleNavigateSupport}
                            >
                                <MuiIcons.Headphones className={styles.Icon} />
                                <p>Hỗ trợ</p>
                            </div>
                        </Tooltip>
                        {/* Báo cáo */}
                        <Tooltip title='Gửi báo cáo'>
                            <div
                                className={`${styles.AbsolutePosition} ${styles.Button}`}
                                style={{
                                    top: "15px",
                                    right: "30px",
                                    cursor: "pointer",
                                }}
                                onClick={() => setIsShowReportModal(true)}
                            >
                                <MuiIcons.ReportOutlined
                                    className={styles.Icon}
                                />
                                <p>Báo cáo</p>
                            </div>
                        </Tooltip>
                    </div>
                    {/* Bài giảng */}
                    {activeStep === 0 && (
                        <>
                            {/* Tiêu đề */}
                            <div className={styles.LessonTitle}>
                                {lesson.title}
                            </div>
                            {/* Nội dung bài giảng */}
                            <div className={styles.Content}>
                                {/* Video */}
                                <VideoComponent
                                    lesson={lesson}
                                    setIsDoneVideo={setIsDoneVideo}
                                    setActiveStep={setActiveStep}
                                />
                                {/* Tóm tắt lý thuyết */}
                                <div className={styles.DocumentWrapper}>
                                    <div
                                        className={styles.Title}
                                        style={{ marginBottom: 0 }}
                                    >
                                        Tóm tắt lý thuyết
                                    </div>
                                    <div className={styles.Document}>
                                        <ReactMarkdown
                                            children={lesson.document}
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Đánh giá và Bình luận */}
                            <div className={styles.Footer}>
                                <div
                                    className={styles.RatingWrapper}
                                    style={{ flex: 1 }}
                                >
                                    <RatingComponent
                                        user={user}
                                        lesson={lesson}
                                    />
                                </div>
                                {/* Bình luận */}
                                {comments && (
                                    <div
                                        className={styles.CommentWrapper}
                                        style={{ flex: 2 }}
                                    >
                                        <CommentComponent
                                            user={user}
                                            comments={comments}
                                            refetch={refetchComment}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {/* Bài tập */}
                    {activeStep === 1 && (
                        <div className={styles.Questions}>
                            {questions.map((question, index) => (
                                <div
                                    key={index}
                                    className={styles.Question}
                                    ref={(el) =>
                                        (inputsRefs.current[index] = el)
                                    }
                                >
                                    {/* Index */}
                                    <div className={styles.Index}>
                                        {"Câu " + (index + 1)}
                                        {` [ ${formatQuestionLevel(
                                            question.level
                                        )} ]`}
                                    </div>
                                    {/* Dạng bài */}
                                    <div
                                        className={styles.Index}
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "normal",
                                        }}
                                    >
                                        <span style={{ fontWeight: "bold" }}>
                                            Dạng bài:{" "}
                                        </span>
                                        {question.type}
                                    </div>
                                    {/* Câu hỏi */}
                                    <div className={styles.QuestionContent}>
                                        {question.content}
                                    </div>
                                    {/* Lựa chọn */}
                                    {question.options.map((option, opIndex) => (
                                        <div
                                            key={opIndex}
                                            className={`${styles.OptionWrapper}`}
                                            onClick={() =>
                                                hanldeCheck(index, option)
                                            }
                                        >
                                            <div className={styles.Index}>
                                                {opIndex === 0
                                                    ? "A"
                                                    : opIndex === 1
                                                    ? "B"
                                                    : opIndex === 2
                                                    ? "C"
                                                    : "D"}
                                            </div>
                                            <div
                                                key={opIndex}
                                                className={`${styles.Option} ${
                                                    inputs[index].state ===
                                                        "true" &&
                                                    inputs[index].question
                                                        .correctAnswer ===
                                                        option
                                                        ? styles.True
                                                        : ""
                                                } ${
                                                    inputs[index].state ===
                                                        "false" &&
                                                    inputs[index].input ===
                                                        option
                                                        ? styles.False
                                                        : ""
                                                }`}
                                            >
                                                {option}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Gợi ý */}
                                    <div
                                        style={{
                                            maxHeight:
                                                showHints[index] === true
                                                    ? `${inputsRefs.current[index]?.scrollHeight}px`
                                                    : "0px",
                                            overflow: "hidden",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <div className={styles.Index}>
                                            Gợi ý
                                        </div>
                                        <div className={styles.QuestionContent}>
                                            {question.hint}
                                        </div>
                                    </div>
                                    {/* Bài giải */}
                                    <div
                                        style={{
                                            maxHeight:
                                                showExplanations[index] === true
                                                    ? `${inputsRefs.current[index]?.scrollHeight}px`
                                                    : "0px",
                                            overflow: "hidden",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <div className={styles.Index}>
                                            Bài giải
                                        </div>
                                        <div className={styles.QuestionContent}>
                                            {question.explanation}
                                        </div>
                                    </div>
                                    {/* Hint toggle */}
                                    <Tooltip title='Gợi ý'>
                                        <div
                                            className={`${styles.AbsolutePosition} ${styles.Button}`}
                                            style={{
                                                top: "40px",
                                                right: "110px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                handleShowHint(index)
                                            }
                                        >
                                            <MuiIcons.LightbulbOutlined />
                                        </div>
                                    </Tooltip>
                                    {/* Show explanation toggle */}
                                    <Tooltip title='Bài giải'>
                                        <div
                                            className={`${styles.AbsolutePosition} ${styles.Button}`}
                                            style={{
                                                top: "40px",
                                                right: "60px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                handleShowExplanation(index)
                                            }
                                        >
                                            <MuiIcons.VisibilityOutlined />
                                        </div>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Toggle */}
                    <div
                        className={`${styles.Toggle} ${styles.NavbarToggle}`}
                        style={{ top: 90 }}
                        onClick={() => setIsShowNavigationBar(true)}
                    >
                        <Tooltip title='Thanh điều hướng' placement='right'>
                            <MuiIcons.Menu style={{ color: "#1b84ff" }} />
                        </Tooltip>
                    </div>
                    <div
                        className={`${styles.Toggle} ${styles.LikeToggle}`}
                        style={{ top: 130 }}
                        onClick={handleLike}
                    >
                        <Tooltip title='Yêu thích' placement='right'>
                            {isLiked ? (
                                <MuiIcons.Favorite
                                    style={{ color: "#f87171" }}
                                />
                            ) : (
                                <MuiIcons.FavoriteBorder
                                    style={{ color: "#f87171" }}
                                />
                            )}
                        </Tooltip>
                    </div>
                    {/* Thanh điều khiển */}
                    <NavigationBar
                        isOpen={isShowNavigationBar}
                        onClose={() => setIsShowNavigationBar(false)}
                    />
                    {/* Rating modal */}
                    <div className={styles.Modal}></div>
                    {/* Report modal */}
                    <ReportModal
                        isOpen={isShowReportModal}
                        onClose={() => setIsShowReportModal(false)}
                    />
                </>
            )}
        </div>
    );
};

export default LessonStudyPage;

// Công cụ hiển thị video
function VideoComponent({ lesson, setIsDoneVideo, setActiveStep }) {
    const videoRef = useRef(null);

    const handleSeek = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            videoRef.current.play();
        }
    };

    return (
        <div className={styles.VideoWrapper}>
            <video
                ref={videoRef}
                controls
                className={styles.Video}
                src={lesson.video.url}
                onTimeUpdate={(e) => {
                    const currentTime = e.target.currentTime;
                    const duration = e.target.duration;
                    if (currentTime / duration > 0.9) {
                        setIsDoneVideo(true);
                    }
                }}
            >
                Trình duyệt không hỗ trợ video.
            </video>
            <div style={{ padding: "0 20px" }}>
                <div className={styles.Title}>Mục lục</div>
                <div className={styles.ChapterList}>
                    {lesson.video.chapters.map((chapter, index) => (
                        <button
                            key={index}
                            onClick={() => handleSeek(chapter.time)}
                            className={styles.ChapterItem}
                        >
                            <VideoThumbnail
                                videoUrl={lesson.video.url}
                                time={chapter.time}
                            />
                            <div className={styles.ChapterTime}>
                                ⏱ {formatTimer(chapter.time)} - {chapter.title}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
// Tạo thumbnail cho chapter trong video
function VideoThumbnail({ videoUrl, time }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleSeeked = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL("image/png");
            setThumbnail(imageUrl);
        };

        const handleLoadedMetadata = () => {
            // Khi video đã load metadata, mới set time
            if (time >= 0 && time <= video.duration) {
                video.currentTime = time;
            } else {
                video.currentTime = 0;
            }
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("seeked", handleSeeked);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("seeked", handleSeeked);
        };
    }, [videoUrl, time]);

    return (
        <>
            <video
                ref={videoRef}
                src={videoUrl}
                crossOrigin='anonymous'
                muted
                playsInline
                style={{ display: "none" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {thumbnail && (
                <img
                    src={thumbnail}
                    alt={`Thumbnail at ${time}s`}
                    className={styles.VideoThumbnail}
                    style={{ width: "100%", borderRadius: "8px" }}
                />
            )}
        </>
    );
}
// Modal báo cáo
function ReportModal({ isOpen, onClose }) {
    const { lessonId } = useParams();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        title: "",
        question: "",
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await Support.Create({
            ...formData,
            title: `Báo cáo ở bài học ${lessonId}: ${formData.title}`,
        });
        if (res === true) {
            setFormData({
                name: "",
                email: "",
                title: "",
                question: "",
            });
            Noti.success("Gửi báo cáo thành công");
            onClose && onClose();
        }
    };
    return (
        <>
            {isOpen && <div className={styles.Overlay} onClick={onClose}></div>}
            <div className={`${styles.Modal} ${isOpen ? styles.open : ""}`}>
                <div className={styles.Title}>Báo cáo</div>
                {/* Close */}
                <div
                    className={`${styles.AbsolutePosition} ${styles.CloseButton}`}
                    style={{
                        top: "20px",
                        right: "20px",
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    <MuiIcons.Close />
                </div>
                {/* Report form */}
                <div className={styles.ReportForm}>
                    <form onSubmit={handleSubmit} className={styles.Form}>
                        <div className='row'>
                            <div className={styles.ColLeft}>
                                <div className={styles.Field}>
                                    <input
                                        type='text'
                                        name='name'
                                        placeholder='Họ tên'
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.ColRight}>
                                <div className={styles.Field}>
                                    <input
                                        type='email'
                                        name='email'
                                        placeholder='Email'
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
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
                        <div className={styles.Field}>
                            <textarea
                                name='question'
                                placeholder='Nội dung báo cáo'
                                value={formData.question}
                                onChange={handleChange}
                                rows='10'
                                required
                            ></textarea>
                        </div>
                        <div
                            className={styles.Button}
                            style={{ width: 200, margin: "0 auto" }}
                            onClick={handleSubmit}
                        >
                            Gửi yêu cầu
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
// Thanh điều hướng
function NavigationBar({ isOpen, onClose }) {
    const nav = useNavigate();
    const { lessonId } = useParams();
    const { user } = useContext(AuthContext);
    const [openChapterIndex, setOpenChapterIndex] = useState(0);
    const lessonListRefs = useRef([]);
    // Lấy toàn bộ chapter thông qua lessonId
    const { data: chapters } = useFetch({
        url: `http://localhost:8080/api/chapter?lessonId=${lessonId}`,
        method: "GET",
        deps: [lessonId],
    });
    // Lấy dữ liệu bài học đã hoàn thành của user
    const { data: donedLesson } = useFetch({
        url: `http://localhost:8080/api/user/done?userId=${user?._id}`,
        method: "GET",
        deps: [lessonId, user],
    });
    const handleChapterClick = (index) => {
        setOpenChapterIndex((prev) => (prev === index ? null : index));
    };
    const handleNav = (id) => {
        onClose && onClose();
        nav(`/study/lesson/${id}`);
    };
    return (
        <>
            {isOpen && <div className={styles.Overlay} onClick={onClose}></div>}
            <div
                className={`${styles.NavigationBar} ${
                    isOpen ? styles.open : ""
                }`}
            >
                <div className={styles.Title}>Điều hướng</div>
                {/* Close */}
                <div
                    className={`${styles.AbsolutePosition} ${styles.CloseButton}`}
                    style={{
                        top: "10px",
                        right: "20px",
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    <MuiIcons.Close />
                </div>
                {/* Links */}
                <div className={styles.Chapters}>
                    {/* Chapter */}
                    {chapters &&
                        donedLesson &&
                        chapters.map((chapter, index) => (
                            <div key={index}>
                                {/* Chapter title */}
                                <div
                                    className={`${styles.Chapter} ${
                                        openChapterIndex === index
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleChapterClick(index)}
                                >
                                    {chapter.title}
                                </div>
                                {/* Lesson list */}
                                <div
                                    ref={(el) =>
                                        (lessonListRefs.current[index] = el)
                                    }
                                    className={styles.LessonList}
                                    style={{
                                        maxHeight:
                                            openChapterIndex === index
                                                ? `${lessonListRefs.current[index]?.scrollHeight}px`
                                                : "0px",
                                        overflow: "hidden",
                                    }}
                                >
                                    {chapter.lessons.map((lesson) => (
                                        <div
                                            key={lesson._id}
                                            className={`${styles.Lesson} ${
                                                lesson._id === lessonId
                                                    ? styles.active
                                                    : ""
                                            } ${
                                                donedLesson.includes(lesson._id)
                                                    ? styles.done
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleNav(lesson._id)
                                            }
                                        >
                                            {lesson.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}
// Chức năng đánh giá bài học
function RatingComponent({ user, lesson }) {
    const [isShowRatingModal, setIsShowRatingModal] = useState(false);
    // Xử lý đánh giá của người dùng
    const [average, setAverage] = useState(lesson.rating.overall);
    const [userRate, setUserRate] = useState({});
    useEffect(() => {
        let rateOfUser = lesson.rating.details.find(
            (detail) => detail.userId._id === user._id
        );
        if (rateOfUser) {
            setUserRate(rateOfUser);
        }
    }, [user, lesson.rating.details]);
    // Xử lý đánh giá trong lesson
    const [ratings, setRatings] = useState([0, 0, 0, 0, 0]);
    useEffect(() => {
        if (lesson && lesson.rating && Array.isArray(lesson.rating.details)) {
            const counts = [0, 0, 0, 0, 0];

            lesson.rating.details.forEach(({ rate }) => {
                if (rate >= 1 && rate <= 5) {
                    counts[5 - rate]++; // 5 sao vào index 0, 4 sao vào index 1, ...
                }
            });

            setRatings(counts);
        }
    }, [lesson]);
    const total = ratings.reduce((sum, count) => sum + count, 0);

    // Xử lý dữ liệu chi tiết đánh giá được hiển thị
    const [topRating, setTopRating] = useState([]);
    useEffect(() => {
        if (lesson?.rating?.details?.length && user?._id) {
            const sorted = lesson.rating.details
                .filter((item) => item.userId?._id !== user._id) // loại bỏ đánh giá của chính user hiện tại
                .sort((a, b) => b.rate - a.rate) // sắp xếp giảm dần theo rate
                .slice(0, 5);
            setTopRating(sorted);
        }
    }, [lesson, user, ratings]);

    const handleRating = async (ratingData) => {
        try {
            let res = await axios.put(`http://localhost:8080/api/lesson/rate`, {
                lessonId: lesson._id,
                userId: user._id,
                rate: ratingData.rate,
                content: ratingData.content,
            });
            const counts = [0, 0, 0, 0, 0];

            res.data.rating.details.forEach(({ rate }) => {
                if (rate >= 1 && rate <= 5) {
                    counts[5 - rate]++; // 5 sao vào index 0, 4 sao vào index 1, ...
                }
            });

            setRatings(counts);
            setAverage(res.data.rating.overall);
            setUserRate((prev) => ({
                ...prev,
                rate: ratingData.rate,
                content: ratingData.content,
            }));
            setIsShowRatingModal(false);
            Noti.success("Đánh giá thành công!");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đánh giá thất bại");
            }
        }
    };
    const handleDeleteRating = async () => {
        Noti.infoWithYesNo({
            title: "Xóa đánh giá",
            text: "Bạn có chắc chắn muốn xóa đánh giá này không?",
            func: () => deleteRating(),
        });
    };
    const deleteRating = async () => {
        try {
            let res = await axios.put(
                `http://localhost:8080/api/lesson/delete-rate`,
                {
                    lessonId: lesson._id,
                    userId: user._id,
                }
            );
            const counts = [0, 0, 0, 0, 0];

            res.data.rating.details.forEach(({ rate }) => {
                if (rate >= 1 && rate <= 5) {
                    counts[5 - rate]++; // 5 sao vào index 0, 4 sao vào index 1, ...
                }
            });

            setRatings(counts);
            setAverage(res.data.rating.overall);
            setUserRate({});
            Noti.success("Xóa đánh giá thành công!");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Xóa đánh giá thất bại");
            }
        }
    };
    return (
        <>
            {/* Title */}
            <div
                className={styles.Title}
                style={{
                    margin: 0,
                    padding: "10px 20px",
                    borderBottom: "1px solid #f1f1f1",
                }}
            >
                Đánh giá
            </div>
            {/* Rating box */}
            <div className={styles.RatingBox}>
                <div className={styles.left}>
                    <div className={styles.average}>{average.toFixed(1)}</div>
                    <div className={styles.stars}>
                        {[...Array(5)].map((_, i) =>
                            i < userRate.rate ? (
                                <MuiIcons.Star
                                    key={i}
                                    style={{ color: "#fbbf24" }}
                                    onClick={() => setIsShowRatingModal(true)}
                                />
                            ) : (
                                <MuiIcons.StarBorder
                                    key={i}
                                    style={{ color: "#fbbf24" }}
                                    onClick={() => setIsShowRatingModal(true)}
                                />
                            )
                        )}
                    </div>
                    <div className={styles.count}>
                        <MuiIcons.PersonOutlined /> {total} đánh giá
                    </div>
                    <button
                        className={styles.rateBtn}
                        onClick={() => setIsShowRatingModal(true)}
                    >
                        Đánh giá
                    </button>
                </div>
                <div className={styles.right}>
                    {[5, 4, 3, 2, 1].map((star, i) => {
                        const count = ratings[5 - star];
                        const percent = total ? (count / total) * 100 : 0;
                        return (
                            <div key={star} className={styles.barRow}>
                                <span className={styles.starLabel}>
                                    <MuiIcons.Star
                                        style={{ color: "#fbbf24" }}
                                    />
                                    {star}
                                </span>
                                <div className={styles.bar}>
                                    <div
                                        className={styles.fill}
                                        style={{
                                            width: `${percent}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className={styles.count}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Đánh giá của user nếu có  */}
            {userRate && Object.keys(userRate).length !== 0 && (
                <div className={styles.RatingItem}>
                    {/* Avatar */}
                    <div className={styles.RatingUserAvatar}>
                        <img
                            src={
                                user?.profile?.avatarUrl ||
                                "/avatars/profile.png"
                            }
                            alt='avatar'
                            className={styles.AvatarImg}
                        />
                    </div>
                    {/* Thông tin và điều khiển */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            gap: 10,
                        }}
                    >
                        {/* Thông tin đánh giá */}
                        <div className={styles.RatingInfo}>
                            <div className={styles.RatingTitle}>
                                {user?.profile?.fullname ||
                                    "Người dùng ẩn danh"}
                            </div>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, i) =>
                                    i < userRate.rate ? (
                                        <MuiIcons.Star
                                            key={i}
                                            style={{ color: "#fbbf24" }}
                                        />
                                    ) : (
                                        <MuiIcons.StarBorder
                                            key={i}
                                            style={{ color: "#fbbf24" }}
                                        />
                                    )
                                )}
                            </div>
                            <div className={styles.RatingContent}>
                                {userRate.content}
                            </div>
                        </div>
                        {/* Sửa và xóa */}
                        <div className={styles.RatingControls}>
                            <div
                                className={`${styles.RatingControl} ${styles.LeftControl}`}
                                style={{ color: "#1b84ff" }}
                                onClick={() => setIsShowRatingModal(true)}
                            >
                                <MuiIcons.EditOutlined />
                                <p>Sửa</p>
                            </div>
                            <div
                                className={`${styles.RatingControl} ${styles.RightControl}`}
                                style={{ color: "#ef4444" }}
                                onClick={handleDeleteRating}
                            >
                                <MuiIcons.DeleteForeverOutlined />
                                <p>Xóa</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Danh sách rating của người dùng */}
            {topRating &&
                topRating.map((item, index) => (
                    <div key={index} className={styles.RatingItem}>
                        <div className={styles.RatingUserAvatar}>
                            <img
                                src={
                                    item.userId?.profile?.avatarUrl ||
                                    "/avatars/profile.png"
                                }
                                alt='avatar'
                                className={styles.AvatarImg}
                            />
                        </div>
                        <div className={styles.RatingInfo}>
                            <div className={styles.RatingTitle}>
                                {item.userId?.profile?.fullname ||
                                    "Người dùng ẩn danh"}
                            </div>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, i) =>
                                    i < item.rate ? (
                                        <MuiIcons.Star
                                            key={i}
                                            style={{ color: "#fbbf24" }}
                                        />
                                    ) : (
                                        <MuiIcons.StarBorder
                                            key={i}
                                            style={{ color: "#fbbf24" }}
                                        />
                                    )
                                )}
                            </div>
                            <div className={styles.RatingContent}>
                                {item.content}
                            </div>
                        </div>
                    </div>
                ))}
            <RatingModal
                isOpen={isShowRatingModal}
                onClose={() => setIsShowRatingModal(false)}
                userRate={userRate}
                onSubmit={handleRating}
            />
        </>
    );
}
// Modal đánh giá
function RatingModal({ isOpen, onClose, userRate, onSubmit }) {
    const [formData, setFormData] = useState({
        rate: userRate?.rate || 5,
        content: "",
    });

    // Reset formData sau khi xóa dánh giá
    useEffect(() => {
        if (userRate && Object.keys(userRate).length === 0) {
            setFormData({
                rate: 5,
                content: "",
            });
        }
    }, [userRate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };
    return (
        <>
            {isOpen && <div className={styles.Overlay} onClick={onClose}></div>}
            <div className={`${styles.Modal} ${isOpen ? styles.open : ""}`}>
                <div className={styles.Title}>Đánh giá</div>
                {/* Close */}
                <div
                    className={`${styles.AbsolutePosition} ${styles.CloseButton}`}
                    style={{
                        top: "20px",
                        right: "20px",
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    <MuiIcons.Close />
                </div>
                {/* Report form */}
                <div className={styles.ReportForm}>
                    <form onSubmit={handleSubmit} className={styles.Form}>
                        <div className={styles.Field}>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, i) =>
                                    i < formData.rate ? (
                                        <MuiIcons.Star
                                            key={i}
                                            style={{ color: "#fbbf24" }}
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    ["rate"]: i + 1,
                                                })
                                            }
                                        />
                                    ) : (
                                        <MuiIcons.StarBorder
                                            key={i}
                                            style={{ color: "#fbbf24" }}
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    ["rate"]: i + 1,
                                                })
                                            }
                                        />
                                    )
                                )}
                            </div>
                            <textarea
                                name='content'
                                placeholder='Nội dung đánh giá'
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ["content"]: e.target.value,
                                    })
                                }
                                rows='10'
                                required
                                style={{ resize: "vertical" }}
                            ></textarea>
                        </div>
                        <div
                            className={styles.Button}
                            style={{ width: 200, margin: "0 auto" }}
                            onClick={handleSubmit}
                        >
                            Đánh giá
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
// Chức năng bình luận bài học
function CommentComponent({ user, comments, refetch }) {
    const { lessonId } = useParams();
    const [openedReplyIds, setOpenedReplyIds] = useState([]);
    const textareaRef = useRef();
    const [formData, setFormData] = useState({
        content: "",
        replyTo: "",
        commentId: "",
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý like bình luận
    const onLike = async (commentId) => {
        try {
            let res = await axios.put(
                `http://localhost:8080/api/comment/like`,
                {
                    userId: user._id,
                    commentId,
                }
            );
            if (res.data.isLiked) {
                refetch();
                Noti.success("Đã yêu thích bình luận");
            } else {
                refetch();
                Noti.success("Đã hủy yêu thích bình luận");
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Lưu trữ thất bại");
            }
        }
    };
    // Xử lý tạo bình luận
    const handleComment = async () => {
        if (formData.commentId !== "") {
            await axios.put("http://localhost:8080/api/comment", {
                id: formData.commentId,
                content: formData.content,
            });
            setFormData({
                content: "",
                replyTo: "",
                commentId: "",
            });
            refetch();
            Noti.success("Chỉnh sửa bình luận thành công");
        } else {
            await axios.post("http://localhost:8080/api/comment", {
                lessonId,
                user: user._id,
                content: formData.content,
                replyTo: formData.replyTo,
            });
            setFormData({
                content: "",
                replyTo: "",
                commentId: "",
            });
            refetch();
            Noti.success("Thêm bình luận thành công");
        }
    };
    const handleOnEdit = (comment) => {
        setFormData({
            content: `${comment.content}`,
            replyTo: "",
            commentId: comment._id,
        });
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };
    const handleOnReply = (comment) => {
        setFormData({
            content: `@${comment.user.profile.fullname} `,
            replyTo: comment._id,
            commentId: "",
        });
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };
    // Xử lý xóa bình luận
    const handleDeleteComment = async (commentId) => {
        Noti.infoWithYesNo({
            title: "Xóa bình luận",
            text: "Bạn có chắc chắn muốn xóa bình luận này không?",
            func: () => deleteComment(commentId),
        });
    };
    const deleteComment = async (commentId) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/comment/${commentId}`
            );
            refetch();
            Noti.success("Xóa bình luận thành công!");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Xóa bình luận thất bại");
            }
        }
    };
    const toggleReplies = (commentId) => {
        setOpenedReplyIds((prev) =>
            prev.includes(commentId)
                ? prev.filter((id) => id !== commentId)
                : [...prev, commentId]
        );
    };
    return (
        <>
            {/* Title */}
            <div
                className={styles.Title}
                style={{
                    margin: 0,
                    padding: "10px 20px",
                    borderBottom: "1px solid #f1f1f1",
                }}
            >
                Bình luận
            </div>
            {/* Tạo bình luận mới */}
            <div className={styles.CommentItem}>
                <div className={styles.CommentUserAvatar}>
                    <img
                        src={user?.profile?.avatarUrl || "/avatars/profile.png"}
                        alt='avatar'
                        className={styles.AvatarImg}
                    />
                </div>
                {/* Thông tin và điều khiển */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        gap: 10,
                    }}
                >
                    {/* Nội dung bình luận */}
                    <textarea
                        name='content'
                        placeholder='Nội dung bình luận'
                        value={formData.content}
                        onChange={handleChange}
                        rows='5'
                        required
                        ref={textareaRef}
                    />

                    {/* Điều khiển */}
                    <div
                        className={`${styles.CommentControl}`}
                        style={{
                            color: "#fff",
                            backgroundColor: "#48c24a",
                            width: 120,
                        }}
                        onClick={handleComment}
                    >
                        <MuiIcons.ReplyOutlined />
                        <p>Bình luận</p>
                    </div>
                </div>
            </div>
            {/* Danh sách bình luận */}
            {comments.map((item, index) => (
                <div key={index}>
                    <Comment
                        item={item}
                        onLike={onLike}
                        user={user}
                        onDelete={handleDeleteComment}
                        onReply={() => handleOnReply(item)}
                        onEdit={() => handleOnEdit(item)}
                    />
                    {/* Reply */}
                    {item?.replies.length > 0 && (
                        <>
                            <div onClick={() => toggleReplies(item._id)}>
                                {openedReplyIds.includes(item._id) ? (
                                    <div className={styles.ReplyToggle}>
                                        <MuiIcons.KeyboardArrowUpOutlined />
                                        {`${item.replies.length} câu trả lời`}
                                    </div>
                                ) : (
                                    <div className={styles.ReplyToggle}>
                                        <MuiIcons.KeyboardArrowDownOutlined />
                                        {`${item.replies.length} câu trả lời`}
                                    </div>
                                )}
                            </div>
                            <div
                                style={{
                                    marginLeft: 65,
                                }}
                            >
                                {openedReplyIds.includes(item._id) &&
                                    item.replies.map((reply, index) => (
                                        <Comment
                                            key={index}
                                            item={reply}
                                            onLike={onLike}
                                            user={user}
                                            onDelete={handleDeleteComment}
                                        />
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}
function Comment({ item, onLike, user, onDelete, onReply, onEdit }) {
    return (
        <div className={styles.CommentItem}>
            <div className={styles.CommentUserAvatar}>
                <img
                    src={
                        item.user?.profile?.avatarUrl || "/avatars/profile.png"
                    }
                    alt='avatar'
                    className={styles.AvatarImg}
                />
            </div>
            {/* Thông tin và điều khiển */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    gap: 10,
                }}
            >
                {/* Thông tin */}
                <div className={styles.CommentInfo}>
                    {/* Tên người dùng */}
                    <div className={styles.CommentTitle}>
                        {item.user?.profile?.fullname || "Người dùng ẩn danh"}
                        <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                    {/* Nội dung bình luận */}
                    <div className={styles.CommentContent}>{item.content}</div>
                </div>
                {/* điều khiển */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,
                    }}
                >
                    <div
                        className={styles.CommentControl}
                        style={{ color: "#1b84ff", width: 50 }}
                        onClick={() => onLike(item._id)}
                    >
                        {item.likes.includes(user._id) ? (
                            <MuiIcons.FavoriteOutlined />
                        ) : (
                            <MuiIcons.FavoriteBorderOutlined />
                        )}
                        <p>{item?.likes.length}</p>
                    </div>
                    <div
                        className={styles.CommentControl}
                        style={{ color: "#1b84ff" }}
                        onClick={onReply}
                    >
                        <MuiIcons.ReplyOutlined />
                        <p>Trả lời</p>
                    </div>
                    {item?.user._id === user._id && (
                        <div className={styles.CommentControls}>
                            <div
                                className={`${styles.CommentControl} ${styles.LeftControl}`}
                                style={{ color: "#1b84ff" }}
                                onClick={onEdit}
                            >
                                <MuiIcons.EditOutlined />
                                <p>Sửa</p>
                            </div>
                            <div
                                className={`${styles.CommentControl} ${styles.RightControl}`}
                                style={{ color: "#ef4444" }}
                                onClick={() => onDelete(item._id)}
                            >
                                <MuiIcons.DeleteForeverOutlined />
                                <p>Xóa</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
