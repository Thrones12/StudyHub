import React, { useState, useRef, useEffect, useContext } from "react";
import "./SubjectList.css";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SubjectList = ({ course }) => {
    const API = constants.API;
    const nav = useNavigate();
    const { userId } = useContext(AuthContext);
    const [user, setUser] = useState();
    const [expanded, setExpanded] = useState(false);
    const [height, setHeight] = useState("0px");
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${API}/user/get-one?id=${userId}`);
            let data = res.data.data;

            setUser(data);
        };
        if (userId) {
            fetchData();
        }
    }, [userId, API]);

    useEffect(() => {
        if (wrapperRef.current) {
            const scrollHeight = wrapperRef.current.scrollHeight;
            if (expanded) {
                setHeight(`${scrollHeight}px`);
            } else {
                setHeight("140px");
            }
        }
    }, [expanded]);

    const getLessonStats = (learned, courseId, subjectId) => {
        const course = learned.find((c) => c.courseId === courseId);
        if (!course) return { total: 0, done: 0 };

        const subject = course.subjects.find((s) => s.subjectId === subjectId);
        if (!subject) return { total: 0, done: 0 };

        const total = subject.lessons.length;
        const done = subject.lessons.filter((lesson) => lesson.isDone).length;

        return { total, done };
    };

    const handleNavigate = (subject) => {
        if (countTotalLessons(subject) === 0) {
            Noti.info("Môn học bạn chọn hiện chưa có bài giảng");
            return;
        }

        nav(
            `/study/${course.tag}/${subject.tag}/${subject.chapters[0].lessons[0]}`
        );
    };

    const countTotalLessons = (subject) => {
        return subject.chapters.reduce((total, chapter) => {
            return total + (chapter.lessons?.length || 0);
        }, 0);
    };

    return (
        <div className='subject-wrapper'>
            <div
                className='subject-list-wrapper'
                style={{ maxHeight: height }}
                ref={wrapperRef}
            >
                <div className='subject-list'>
                    {user &&
                        course.subjects.map((subject, index) => {
                            const { total, done } = getLessonStats(
                                user.learned,
                                course._id,
                                subject._id
                            );
                            const percent =
                                total === 0
                                    ? 0
                                    : ((done / total) * 100).toFixed(0);
                            return (
                                <div className='subject-card' key={index}>
                                    <div className='progress-bar-wrapper'>
                                        <div
                                            className='progcess-bar'
                                            style={{ "--score": `${percent}%` }}
                                        >
                                            <div className='text'>{`${percent}%`}</div>
                                        </div>
                                    </div>
                                    <div className='info'>
                                        <div className='title'>
                                            {subject.title}
                                        </div>
                                        <div className='lesson'>{`${done} / ${total} bài học`}</div>
                                        <div className='button-wrapper'>
                                            <button
                                                onClick={() =>
                                                    handleNavigate(subject)
                                                }
                                            >
                                                Vào học
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {course.subjects.length > 4 && (
                <div className='toggle-btn-wrapper'>
                    <button
                        className='toggle-btn'
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubjectList;
