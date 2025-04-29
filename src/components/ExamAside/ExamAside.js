import React, { useEffect, useState } from "react";
import "./ExamAside.css";

const ExamAside = ({
    exam,
    courseTitle,
    subjectTitle,
    handleSubmit,
    handleRedo,
    questions,
    questionRefs,
    isStart,
    isExamDone,
}) => {
    const [timeLeft, setTimeLeft] = useState(exam.duration);
    const [result, setResult] = useState({
        trueAnswer: 0,
        falseAnswer: 0,
        notDoneAnswer: 0,
        time: 0,
        percent: 0,
        score: 0,
    });

    useEffect(() => {
        if (isStart && !isExamDone) {
            if (timeLeft <= 0) {
                handleSubmit();
                return;
            }

            const timeout = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearTimeout(timeout);
        } else {
            {
                let trueAnswer = questions.filter(
                    (q) => q.state === "true"
                ).length;
                let falseAnswer = questions.filter(
                    (q) => q.state === "false"
                ).length;
                let notDoneAnswer = questions.filter(
                    (q) => q.state === "not_done"
                ).length;

                setResult({
                    trueAnswer: trueAnswer,
                    falseAnswer: falseAnswer,
                    notDoneAnswer: notDoneAnswer,
                    time: exam.duration - timeLeft,
                    percent:
                        ((questions.length - notDoneAnswer) /
                            questions.length) *
                        100,
                    score: (trueAnswer / questions.length) * 10,
                });
            }
        }
    }, [timeLeft, handleSubmit]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const refClick = (index) => {
        const headerOffset = 80; // chiều cao header (ví dụ: 80px)
        const element = questionRefs.current[index];
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = window.scrollY + elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    };

    const middlewareRedo = () => {
        setResult({
            trueAnswer: 0,
            falseAnswer: 0,
            notDoneAnswer: 0,
            time: 0,
            percent: 0,
            score: 0,
        });
        setTimeLeft(exam.duration);
        handleRedo();
    };
    return (
        <div className='exam-aside'>
            <div className='header'>
                <div className='title'>{exam.title}</div>
                <div className='course-subject'>
                    {courseTitle + " - " + subjectTitle}
                </div>
            </div>
            <div style={{ position: "relative", height: 200 }}>
                {/* BEGIN: Timer */}
                <div
                    className='timer'
                    style={{
                        transform: isExamDone
                            ? "translateX(-400px)"
                            : "translateX(0)",
                    }}
                >
                    <div className='text'>Thời gian còn lại:</div>
                    <div className={`exam-timer`}>
                        <p>{formatTime(timeLeft)}</p>
                    </div>
                </div>
                {/* END: Timer */}

                {/* BEGIN: Result */}
                <div
                    className='result'
                    style={{
                        transform: isExamDone
                            ? "translateX(0)"
                            : "translateX(400px)",
                    }}
                >
                    <div className='main'>
                        <div className='info'>
                            <div className='name'>
                                Phong Phong Phong Phong Phong PhongPhong Phong
                                Phong
                            </div>
                            <div className='stat'>
                                Hoàn thành: {result.percent.toFixed(2)}%
                            </div>
                            <div className='stat'>
                                Thời gian: {formatTime(result.time)}
                            </div>
                            <div className='stat'>
                                Điểm số: {result.score.toFixed(1)}
                            </div>
                        </div>
                        <div
                            className='score'
                            style={{
                                "--exam-score": `${(result.score * 10).toFixed(
                                    1
                                )}%`,
                            }}
                        >
                            <div className='text'>
                                {result.score.toFixed(1)}
                            </div>
                        </div>
                    </div>
                    <div className='footer'>
                        <div className='info-box green'>
                            {result.trueAnswer} câu
                        </div>
                        <div className='info-box red'>
                            {result.falseAnswer} câu
                        </div>
                        <div className='info-box gray'>
                            {result.notDoneAnswer} câu
                        </div>
                    </div>
                </div>
                {/* END: Result */}
            </div>
            <div className='text'>Câu hỏi:</div>
            <div className='question-list'>
                {questions.map((q, index) => (
                    <div
                        onClick={() => refClick(index)}
                        className={`question-item ${
                            q.state === "done"
                                ? "done"
                                : q.state === "true"
                                ? "true"
                                : q.state === "false"
                                ? "false"
                                : ""
                        }`}
                        key={index}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
            <div className='button-wrapper'>
                <button
                    type='button'
                    className={isExamDone ? "redo-btn" : "submit-btn"}
                    onClick={
                        isExamDone
                            ? () => middlewareRedo()
                            : () => handleSubmit(exam.duration - timeLeft)
                    }
                >
                    {isExamDone ? "Làm lại" : "Nộp bài"}
                </button>
            </div>
        </div>
    );
};

export default ExamAside;
