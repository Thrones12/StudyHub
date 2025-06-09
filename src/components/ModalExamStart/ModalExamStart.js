import React, { useEffect, useState } from "react";
import "./ModalExamStart.css";
import axios from "axios";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import ModalSave from "../ModalSave/ModalSave";
import ModalAddStorage from "../ModalAddStorage/ModalAddStorage";
import { useParams } from "react-router-dom";

const ExamStartModal = ({
    isShow,
    setIsShow,
    onStart,
    exam,
    courseTitle,
    subjectTitle,
}) => {
    const API = constants.API;
    const { examId } = useParams();
    const [examResult, setExamResult] = useState();
    const [percent, setPercent] = useState(0);
    const [refresh, setRefresh] = useState(false);

    const [isShowModalSave, setIsShowModalSave] = useState(false);
    const [isShowModalAdd, setIsShowModalAdd] = useState(false);
    // Fetch exam
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${API}/examResult/get-one?examId=${exam._id}`
                );
                let data = res.data.data;

                if (data) {
                    setExamResult(data);
                    let donedQuestions = data.result.filter(
                        (r) => r.state !== "not_done"
                    );
                    setPercent(
                        (donedQuestions.length / data.result.length) * 100
                    );
                } else {
                    setExamResult({ score: 0, duration: 0, result: {} });
                    setPercent(0);
                }
            } catch (err) {
                console.log(err);

                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Lỗi khi tải bài học");
                }
            }
        };
        if (exam) {
            fetchData();
        }
    }, [API, exam, isShow, refresh]);

    useEffect(() => {
        if (isShowModalAdd || isShowModalSave) {
            setIsShow(false);
        } else {
            setIsShow(true);
        }
    }, [isShowModalAdd, isShowModalSave]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const toggleSave = async () => {
        setIsShowModalSave(true);
    };
    return (
        <>
            <div
                className={`exam-start-modal ${isShow ? "show" : ""}`}
                style={{ top: 50, left: examId ? 0 : 265 }}
            >
                <div className='exam-overlay'></div>
                <div className='modal'>
                    <div className='header'>
                        <div className='title'>{exam.title}</div>
                        <div className='course-subject'>
                            {courseTitle + " - " + subjectTitle}
                        </div>
                        <FontAwesomeIcon
                            icon={faBookmark}
                            onClick={toggleSave}
                        />
                    </div>
                    {/* BEGIN: Result */}
                    {examResult && (
                        <div className='best-result'>
                            <div className='main'>
                                <div className='info'>
                                    <div className='title'>
                                        Thành tích cao nhất
                                    </div>
                                    <div className='stat'>
                                        Hoàn thành: {percent.toFixed(2)}%
                                    </div>
                                    <div className='stat'>
                                        Thời gian:{" "}
                                        {formatTime(examResult.duration)}
                                    </div>
                                    <div className='stat'>
                                        Điểm số: {examResult.score.toFixed(1)}
                                    </div>
                                </div>
                                <div
                                    className='score'
                                    style={{
                                        "--exam-score": `${
                                            examResult.score * 10
                                        }%`,
                                    }}
                                >
                                    <div className='text'>
                                        {examResult.score.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* END: Result */}
                    <div className='exam-info'>
                        <div className='info-box time'>
                            <FontAwesomeIcon icon={faClock} />
                            {formatTime(exam.duration)}
                        </div>
                        <button onClick={onStart}>Bắt đầu</button>
                        <div className='info-box question'>
                            <FontAwesomeIcon icon={faQuestion} />
                            {exam.questions.length} câu
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <ModalSave
                    isShow={isShowModalSave}
                    setIsShow={setIsShowModalSave}
                    itemId={exam._id}
                    setIsShowModalAdd={setIsShowModalAdd}
                />
                <ModalAddStorage
                    isShow={isShowModalAdd}
                    setIsShow={setIsShowModalAdd}
                    setRefresh={setRefresh}
                />
            </div>
        </>
    );
};

export default ExamStartModal;
