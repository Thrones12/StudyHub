import React, { useEffect, useState, useRef, useContext } from "react";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import "./AsideStudy.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircle,
    faChevronUp,
    faLongArrowAltLeft,
} from "@fortawesome/free-solid-svg-icons";
import {} from "@fortawesome/free-regular-svg-icons";

const AsideStudy = ({ isOpen, refresh }) => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const navigate = useNavigate();
    const { courseTag, subjectTag, lessonId, chapterId } = useParams();
    const [subject, setSubject] = useState();
    const [openChapterIndex, setOpenChapterIndex] = useState(0);
    const lessonListRefs = useRef([]);
    const [doneLessons, setDoneLessons] = useState([]);
    const [doneExams, setDoneExams] = useState([]);

    // Fetch subject
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${API}/subject/get-one?tag=${subjectTag}`
                );
                let data = res.data.data;
                setSubject(data);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Đăng nhập thất bại");
                }
            }
        };
        if (subjectTag) {
            fetchData();
        }
    }, [subjectTag, lessonId, chapterId, API]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/user/get-one?id=${userId}`);
                let data = res.data.data;
                // Flatmap done lesson trong learned user ra
                const allLessons = data.learned.flatMap((course) =>
                    course.subjects.flatMap((subject) =>
                        subject.lessons
                            .filter((lesson) => lesson.isDone)
                            .map((lesson) => lesson.lessonId)
                    )
                );
                setDoneLessons(allLessons);

                setDoneExams(data.examResults.map((result) => result.exam));
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Đăng nhập thất bại");
                }
            }
        };
        if (userId) {
            fetchData();
        }
    }, [userId, API, refresh]);

    const handleChapterClick = (index) => {
        setOpenChapterIndex((prev) => (prev === index ? null : index));
    };

    const goToLesson = (lessonId) => {
        navigate(`/study/${courseTag}/${subjectTag}/${lessonId}`);
    };

    const checkCheckExamIsDone = (exams) => {
        return exams.some((exam) => doneExams.includes(exam));
    };

    return (
        <div className={`aside-study ${isOpen ? "active" : ""}`}>
            {subject && (
                <>
                    <div className='header'>
                        <FontAwesomeIcon
                            icon={faLongArrowAltLeft}
                            onClick={() => navigate("/course")}
                        />
                        <div className='title'>{subject.title}</div>
                    </div>
                    <div className='link-list'>
                        {subject.chapters.map((chapter, index) => (
                            <div
                                key={index}
                                className={`chapter-group ${
                                    openChapterIndex === index ? "open" : ""
                                }`}
                            >
                                <div
                                    className={`chapter-title ${
                                        openChapterIndex === index
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => handleChapterClick(index)}
                                >
                                    <p>{chapter.title}</p>
                                    <FontAwesomeIcon
                                        icon={faChevronUp}
                                        className={`icon ${
                                            openChapterIndex === index
                                                ? "active"
                                                : ""
                                        }`}
                                    />
                                </div>
                                <div
                                    className='lesson-list'
                                    ref={(el) =>
                                        (lessonListRefs.current[index] = el)
                                    }
                                    style={{
                                        maxHeight:
                                            openChapterIndex === index
                                                ? `${lessonListRefs.current[index]?.scrollHeight}px`
                                                : "0px",
                                        overflow: "hidden",
                                        transition: "max-height 0.4s ease",
                                    }}
                                >
                                    {chapter.lessons.map((lesson, lIndex) => (
                                        <div
                                            key={lIndex}
                                            className={`lesson-item${
                                                lesson._id === lessonId
                                                    ? " active"
                                                    : ""
                                            }${
                                                doneLessons.includes(lesson._id)
                                                    ? " done"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                goToLesson(lesson._id)
                                            }
                                        >
                                            {lesson.title}
                                        </div>
                                    ))}
                                    <div
                                        className={`exam-item${
                                            chapter._id === chapterId
                                                ? " active"
                                                : ""
                                        }${
                                            checkCheckExamIsDone(chapter.exams)
                                                ? " done"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            navigate(
                                                `/study/${courseTag}/${subjectTag}/exam/${chapter._id}`
                                            )
                                        }
                                    >
                                        Bài kiểm tra
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AsideStudy;
