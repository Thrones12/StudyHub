import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import constants from "../../utils/constants";
import "./LessonToolBar.css";

const LessonBar = () => {
    const API = constants.API;
    const { tag, lessonId, chapterId } = useParams();
    const location = useLocation(); // Lấy đường dẫn hiện tại
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [selected, setSelected] = useState(null);
    const [completedLesson, setCompletedLesson] = useState([
        "67aa092fe07a8de25c30a648",
        "67d32bb1cbc084035d9b8e94",
    ]);
    const [completedChapterExam, setCompletedChapterExam] = useState([
        "67a9dab2e07a8de25c30a635",
    ]);
    const [isClose, setIsClose] = useState(true);

    // Fetch subject
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/subject/getOne?tag=${tag}`);
                const data = res.data;

                if (!selected) {
                    if (location.pathname.includes("exam")) {
                        navigate(
                            `/subject/${tag}/chapter/${data.chapters[0]._id}`
                        );
                    } else {
                        navigate(
                            `/subject/${tag}/${data.chapters[0].lessons[0]._id}`
                        );
                    }
                }
                setSubject(data);
                setIsClose(true);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [API, tag, navigate, selected, location.pathname]);

    // Fetch subject
    useEffect(() => {
        if (lessonId) setSelected(lessonId);
        if (chapterId) setSelected(chapterId);
    }, [lessonId, chapterId]);

    const isLessonCompleted = (lessonId) => {
        let result = "";
        completedLesson.forEach((lesson) => {
            if (lesson === lessonId) {
                result = "completed";
            }
        });
        completedLesson.forEach((lesson) => {
            if (lesson === lessonId) {
                result = "completed";
            }
        });
        return result;
    };

    const isExamCompleted = (chapterId) => {
        let result = "";
        completedChapterExam.forEach((chapter) => {
            if (chapter === chapterId) {
                result = "completed";
            }
        });
        return result;
    };
    const handleNavigate = () => {
        if (location.pathname.includes("exam", "chapter")) {
            navigate(-1);
        } else {
            navigate("/course");
        }
    };
    return (
        <div className={`lessonbar-wrapper ${isClose ? "close" : ""}`}>
            {subject && (
                <div className='lessonbar'>
                    <div className='title'>
                        {subject.title}
                        <img
                            className='back-icon'
                            src='/icons/left-arrow.png'
                            alt='icon'
                            onClick={handleNavigate}
                        />
                    </div>
                    <div className='horizone'></div>
                    {subject.chapters.length > 0 &&
                        subject.chapters.map((chapter, index) => (
                            <div key={index}>
                                <div key={index} className='chapter'>
                                    {chapter.title}
                                    {chapter.lessons.length > 0 &&
                                        chapter.lessons.map((lesson, index) => (
                                            <Link
                                                className={`lesson ${
                                                    selected === lesson._id
                                                        ? "active"
                                                        : ""
                                                }`}
                                                key={index}
                                                to={`/subject/${tag}/${lesson._id}`}
                                            >
                                                <div
                                                    className={`lesson-check ${isLessonCompleted(
                                                        lesson._id
                                                    )}`}
                                                ></div>
                                                <div className='lesson-title'>
                                                    {lesson.title}
                                                </div>
                                            </Link>
                                        ))}
                                    {/* Exam */}
                                    {chapter.exams.length > 0 && (
                                        <Link
                                            className={`lesson ${
                                                selected === chapter._id
                                                    ? "active"
                                                    : ""
                                            }`}
                                            key={index}
                                            to={`/subject/${tag}/chapter/${chapter._id}`}
                                        >
                                            <div
                                                className={`lesson-check ${isExamCompleted(
                                                    chapter._id
                                                )}`}
                                            ></div>
                                            <div className='lesson-title'>
                                                Kiểm tra
                                            </div>
                                        </Link>
                                    )}
                                </div>
                                <div className='horizone'></div>
                            </div>
                        ))}
                </div>
            )}
            <div className='toggle-close' onClick={() => setIsClose(!isClose)}>
                <img src='/icons/back.png' alt='icon' />
            </div>
            <div
                className={`overlay ${!isClose ? "active" : ""}`}
                onClick={() => setIsClose(true)}
            ></div>
        </div>
    );
};

export default LessonBar;
