import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import "./StorageModalAdd.css";

const StorageModalAdd = ({ onClose, onSubmit, showModal }) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("lesson");

    const handleSubmit = async () => {
        if (!title.trim()) return;
        await onSubmit({ title, type });
        setTitle("");
        onClose();
    };

    return (
        <div
            className={`modal-storage-overlay ${showModal ? "active" : ""}`}
            onClick={onClose}
        >
            <div className='modal' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h2>Thêm mới</h2>
                    <button className='close-btn' onClick={onClose}>
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                </div>
                <div className='modal-body'>
                    <label>Tiêu đề</label>
                    <input
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Nhập tên Storage'
                    />

                    <label>Loại</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value='lesson'>Bài học</option>
                        <option value='exam'>Bài kiểm tra</option>
                        <option value='exercise'>Bài tập</option>
                    </select>
                </div>
                <div className='modal-footer'>
                    <button className='cancel-btn' onClick={onClose}>
                        Hủy
                    </button>
                    <button className='submit-btn' onClick={handleSubmit}>
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StorageModalAdd;
