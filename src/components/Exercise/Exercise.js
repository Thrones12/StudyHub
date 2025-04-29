import { useState, useEffect } from "react";
import "./Exercise.css";

const Exercise = ({ exercises, currentRef, index }) => {
    const [userAnswer, setUserAnswer] = useState("");
    const [status, setStatus] = useState(null); // "correct" | "incorrect"
    const [showAnswer, setShowAnswer] = useState(false);
    const [exercise, setExercise] = useState("");

    useEffect(() => {
        setExercise(getRandomElement(exercises));
    }, [exercises]);

    useEffect(() => {
        if (showAnswer) {
            currentRef[
                index
            ].style.maxHeight = `${currentRef[index].scrollHeight}px`;
        }
    }, [currentRef, index, showAnswer]);

    const handleSubmit = () => {
        if (userAnswer.trim().toLowerCase() === exercise.answer.toLowerCase()) {
            setStatus("correct");
        } else {
            setStatus("incorrect");
        }
    };

    const handleRetry = () => {
        setUserAnswer("");
        setStatus(null);
        setShowAnswer(false);
    };

    const handleReset = async () => {
        setUserAnswer("");
        setStatus(null);
        setShowAnswer(false);
        await setExercise(getRandomElement(exercises, exercise));
        currentRef[
            index
        ].style.maxHeight = `${currentRef[index].scrollHeight}px`;
    };
    const getRandomElement = (arr, currentElement) => {
        if (!Array.isArray(arr) || arr.length === 0) return null; // Kiểm tra mảng hợp lệ
        if (arr.length === 1) return arr[0]; // Nếu chỉ có 1 phần tử thì trả về luôn

        let newElement;
        do {
            newElement = arr[Math.floor(Math.random() * arr.length)];
        } while (newElement === currentElement); // Lặp lại nếu trùng với phần tử hiện tại

        return newElement;
    };
    return (
        <div className='exercise-container'>
            {exercise ? (
                <>
                    <div className='question'>
                        <span style={{ fontWeight: 700 }}>Câu hỏi: </span>
                        {exercise.question}
                    </div>

                    <div className='inputAnswer'>
                        <input
                            type='text'
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder='Nhập câu trả lời...'
                            disabled={status !== null}
                            style={{
                                backgroundColor:
                                    status !== null ? "#d5d5d5" : "#fff",
                            }}
                        />
                        {status ? (
                            status === "correct" ? (
                                <img src='/icons/icon-corret.png' alt='icon' />
                            ) : (
                                <img
                                    src='/icons/icon-incorret.png'
                                    alt='icon'
                                />
                            )
                        ) : (
                            <></>
                        )}
                    </div>

                    {status === null ? (
                        <button onClick={handleSubmit} className='submit-btn'>
                            Xác nhận
                        </button>
                    ) : (
                        <>
                            <button onClick={handleRetry} className='retry-btn'>
                                Làm lại
                            </button>

                            <button
                                onClick={() => setShowAnswer(true)}
                                className='answer-btn'
                            >
                                Đáp án
                            </button>
                        </>
                    )}

                    <button onClick={handleReset} className='reset-btn'>
                        Câu khác
                    </button>

                    {showAnswer && (
                        <p className='answer'>Đáp án đúng: {exercise.answer}</p>
                    )}
                </>
            ) : (
                "Hiện chưa có bài tập"
            )}
        </div>
    );
};

export default Exercise;
