import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faClipboard,
    faPenToSquare,
    faClose,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import "./StorageCard.css";
import { useNavigate } from "react-router-dom";

const storageIcons = {
    lesson: faBookOpen,
    exam: faClipboard,
    exercise: faPenToSquare,
};

const storageInfoTexts = {
    lesson: "bài học",
    exam: "bài kiểm tra",
    exercise: "bài tập",
};
const StorageCard = ({ storage, handleDelete }) => {
    const nav = useNavigate();
    const hanldeClick = () => {
        nav(`/storage/${storage._id}`);
    };
    return (
        <div className='storage-card' onClick={hanldeClick}>
            <button
                className='delete-btn'
                onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ cha
                    handleDelete();
                }}
            >
                <FontAwesomeIcon icon={faClose} />
            </button>
            <div className='icon'>
                <FontAwesomeIcon icon={storageIcons[storage.type]} />
            </div>
            <div className='title'>{storage.title}</div>
            <div className='count'>{`${storage.items.length} ${
                storageInfoTexts[storage.type]
            }`}</div>
        </div>
    );
};

export default StorageCard;
