import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import "./StorageExerciseCard.css";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import axios from "axios";

const StorageExerciseCard = ({ item, storage, setReload }) => {
    const API = constants.API;
    const [optionChoose, setOptionChoose] = useState(-1);
    const [isCheck, setIsCheck] = useState(false);
    const [isShowAnswer, setIsShowAnswer] = useState(false);
    const explanRef = useRef();

    const handleChoose = (index) => {
        setOptionChoose(index);
    };

    const handleSubmit = () => {
        setIsCheck(true);
    };

    const handleRedo = () => {
        setIsCheck(false);
        setOptionChoose(-1);
        setIsShowAnswer(false);
    };

    const handleDelete = async () => {
        Noti.infoWithYesNo({
            title: "Xác nhận xóa",
            text: `Bạn có muốn xóa bài tập này khỏi <strong>${storage.title}</strong>?`,
            confirmText: "Xóa",
            func: () => deleteItem(),
        });
    };
    const deleteItem = async () => {
        try {
            await axios.delete(
                `${API}/storage/delete-item?id=${storage._id}&itemId=${item._id}`
            );
            setReload((prev) => !prev);
            Noti.success("Xóa thành công");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đăng nhập thất bại");
            }
        }
    };
    return (
        <div className='storage-exercise-card'>
            <button className='delete-btn' onClick={handleDelete}>
                <FontAwesomeIcon icon={faClose} />
            </button>
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

export default StorageExerciseCard;
