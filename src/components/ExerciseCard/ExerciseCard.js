import React, { useEffect, useRef, useState } from "react";
import "./ExerciseCard.css";

const ExerciseCard = ({ index, item, handleResult }) => {
    const [optionChoose, setOptionChoose] = useState(-1);
    const [isCheck, setIsCheck] = useState(false);
    const [isShowAnswer, setIsShowAnswer] = useState(false);
    const explanRef = useRef();

    const handleChoose = (index) => {
        setOptionChoose(index);
    };

    const handleSubmit = () => {
        setIsCheck(true);
        let TF = item.options[optionChoose] === item.answer;
        console.log(TF);

        handleResult(index, TF);
    };

    const handleRedo = () => {
        setIsCheck(false);
        setOptionChoose(-1);
        setIsShowAnswer(false);
    };

    return (
        <div className='exercise-card'>
            <div className='question'>{item.question}</div>
            {item.options.map((op, i) => (
                <div
                    key={i}
                    className={`option-wrapper ${isCheck ? "disabled" : ""}`}
                >
                    <div className='option-index'>
                        {i === 0 ? "A" : i === 1 ? "B" : i === 2 ? "C" : "D"}
                    </div>
                    <div
                        key={i}
                        className={`option ${
                            optionChoose === i ? "checked" : ""
                        } ${
                            isCheck &&
                            optionChoose === i &&
                            item.options[optionChoose] === item.answer
                                ? "true"
                                : ""
                        } ${
                            isCheck &&
                            optionChoose === i &&
                            item.options[optionChoose] !== item.answer
                                ? "false"
                                : ""
                        }`}
                        onClick={() => handleChoose(i)}
                    >
                        {op}
                    </div>
                </div>
            ))}
            <div className='btn-wrapper'>
                {isCheck ? (
                    <>
                        <button
                            type='button'
                            className='btn btn-blue'
                            onClick={handleRedo}
                        >
                            Làm lại
                        </button>
                        <button
                            type='button'
                            className='btn btn-gray'
                            onClick={() => setIsShowAnswer(!isShowAnswer)}
                        >
                            Bài giải
                        </button>
                    </>
                ) : (
                    <button
                        type='button'
                        className='btn btn-green'
                        onClick={handleSubmit}
                    >
                        Kiểm tra
                    </button>
                )}
            </div>
            <div
                ref={explanRef}
                style={{
                    maxHeight: isShowAnswer
                        ? `${explanRef.current?.scrollHeight}px`
                        : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.4s ease",
                }}
            >
                <div className='explanation'>
                    <div style={{ marginBottom: 10 }}>
                        Đáp án: {item.answer}
                    </div>
                    <div>Bài giải: {item.explanation}</div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseCard;
