import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import constants from "../../utils/constants";
import { AuthContext } from "../../context/AuthContext";
import Noti from "../../utils/Noti";
import "./StudyExamPage.css";
import ExamAside from "../../components/ExamAside/ExamAside";
import ModalExamStart from "../../components/ModalExamStart/ModalExamStart";

const StudyExamPage = () => {
    const API = constants.API;
    const nav = useNavigate();
    const { userId } = useContext(AuthContext);
    const { courseTag, subjectTag, chapterId, examId } = useParams();
    const context = useOutletContext() || {};
    const triggerRefreshAside = context.triggerRefreshAside;
    const [exam, setExam] = useState(null);
    const [isShow, setIsShow] = useState(true);
    const [isStart, setIsStart] = useState(false);
    const [isExamDone, setIsExamDone] = useState(false);
    const [questions, setQuestions] = useState([]);
    const questionRefs = useRef([]);
    const [courseTitle, setCourseTitle] = useState("");
    const [subjectTitle, setSubjectTitle] = useState("");

    // Fetch exam
    useEffect(() => {
        const fetchData = async () => {
            try {
                let randomExam;
                console.log(chapterId);

                if (chapterId) {
                    const res = await axios.get(
                        `${API}/chapter/get-one?id=${chapterId}`
                    );
                    let data = res.data.data;
                    randomExam =
                        data.exams[
                            Math.floor(Math.random() * data.exams.length)
                        ];
                } else {
                    const res = await axios.get(
                        `${API}/exam/get-one?id=${examId}`
                    );
                    let data = res.data.data;
                    randomExam = data;
                }

                if (randomExam) {
                    console.log(randomExam);

                    setExam(randomExam);
                    setQuestions(
                        randomExam.questions.map((q) => ({
                            question: q,
                            input: "",
                            state: "not_done",
                        }))
                    );
                } else {
                    Noti.infoWithDirection({
                        text: "Hiện tại chưa có bài kiểm tra",
                        confirmText: "Quay lại",
                        func: () => nav(-1),
                    });
                }
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Lỗi khi tải bài kiểm tra");
                }
            }
        };
        if (chapterId || examId) {
            fetchData();
        }
    }, [API, chapterId, examId, courseTag, subjectTag, nav]);
    // Fetch title
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${API}/exam/get-title?id=${exam._id}`
                );
                let data = res.data.data;
                setCourseTitle(data.courseTitle);
                setSubjectTitle(data.subjectTitle);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Tải trang thất bại");
                }
            }
        };
        if (exam) {
            fetchData();
        }
    }, [API, exam, courseTitle, subjectTitle]);

    const hanldeCheck = (questionIndex, option) => {
        setQuestions(
            questions.map((q, i) =>
                i === questionIndex
                    ? { question: q.question, input: option, state: "done" }
                    : q
            )
        );
    };

    const handleSubmit = async (duration) => {
        // Kiểm tra đúng sai
        const checkQuestions = questions.map((q, i) =>
            q.state === "done"
                ? q.question.answer === q.input
                    ? {
                          question: q.question,
                          input: q.input,
                          state: "true",
                      }
                    : {
                          question: q.question,
                          input: q.input,
                          state: "false",
                      }
                : q
        );
        setQuestions(checkQuestions);
        setIsExamDone(true);

        try {
            let trueAnswer = checkQuestions.filter(
                (q) => q.state === "true"
            ).length;
            await axios.post(`${API}/examResult`, {
                user: userId,
                exam: exam._id,
                chapterId: chapterId,
                score: (trueAnswer / questions.length) * 10,
                duration: duration,
                result: checkQuestions,
            });
            if (typeof triggerRefreshAside === "function") {
                triggerRefreshAside();
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Lỗi khi tải bài kiểm tra");
            }
        }
    };

    const handleRedo = () => {
        setIsShow(true);
        setIsStart(false);
        setIsExamDone(false);
        setQuestions(
            exam.questions.map((q) => ({
                question: q,
                input: "",
                state: "not_done",
            }))
        );
    };

    const handleStart = () => {
        setIsStart(true);
        setIsShow(false);
    };
    return (
        <div className='container'>
            {exam && courseTitle && subjectTitle && (
                <div className='study-exam-page'>
                    <ExamAside
                        exam={exam}
                        courseTitle={courseTitle}
                        subjectTitle={subjectTitle}
                        handleSubmit={handleSubmit}
                        handleRedo={handleRedo}
                        questions={questions}
                        questionRefs={questionRefs}
                        isStart={isStart}
                        isExamDone={isExamDone}
                    />
                    <div className='exam-questions'>
                        {exam.questions.map((q, i) => (
                            <div
                                key={i}
                                className='exam-question-card'
                                ref={(el) => (questionRefs.current[i] = el)}
                            >
                                <div className='question-index'>
                                    {"Câu " + (i + 1)}
                                </div>
                                <div className='question'>{q.question}</div>
                                {q.options.map((op, index) => (
                                    <div
                                        key={index}
                                        className={`option-wrapper ${
                                            isExamDone ? "disabled" : ""
                                        }`}
                                        onClick={() => hanldeCheck(i, op)}
                                    >
                                        <div className='option-index'>
                                            {index === 0
                                                ? "A"
                                                : index === 1
                                                ? "B"
                                                : index === 2
                                                ? "C"
                                                : "D"}
                                        </div>
                                        <div
                                            key={index}
                                            className={`option ${
                                                questions[i].state === "done" &&
                                                questions[i].input === op
                                                    ? "checked"
                                                    : ""
                                            } ${
                                                questions[i].question.answer ===
                                                    op &&
                                                questions[i].state === "true"
                                                    ? "true"
                                                    : ""
                                            } ${
                                                questions[i].state ===
                                                    "false" &&
                                                questions[i].input === op
                                                    ? "false"
                                                    : ""
                                            }`}
                                        >
                                            {op}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <ModalExamStart
                        isShow={isShow}
                        setIsShow={setIsShow}
                        onStart={handleStart}
                        exam={exam}
                        courseTitle={courseTitle}
                        subjectTitle={subjectTitle}
                    />
                </div>
            )}
        </div>
    );
};

export default StudyExamPage;
