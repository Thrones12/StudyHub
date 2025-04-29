import React, { useContext, useEffect, useState } from "react";
import "./ModalAddStorage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faClose } from "@fortawesome/free-solid-svg-icons";
import constants from "../../utils/constants";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Noti from "../../utils/Noti";

const ModalAddStorage = ({ isShow, setIsShow, setRefresh }) => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("exam");

    useEffect(() => {
        if (!isShow) {
            setTitle("");
            setType("exam");
        }
    }, [isShow]);

    const handleAdd = async () => {
        if (!title.trim()) {
            Noti.info("Vui lòng nhập tiêu đề");
            return;
        }
        try {
            await axios.post(`${API}/storage`, { userId, title, type });
            Noti.success("Thêm thành công");
            setTitle("");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Lỗi khi storage");
            }
        }
    };
    return (
        <div className={`modal-add-storage ${isShow ? "show" : ""}`}>
            <div
                className='modal-overlay'
                onClick={() => setIsShow(false)}
            ></div>
            <div className='modal'>
                <div className='header'>
                    Danh sách lưu trữ mới
                    <FontAwesomeIcon
                        icon={faClose}
                        onClick={() => setIsShow(false)}
                    />
                </div>
                <div className='modal-input'>
                    <input
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Tiêu đề'
                    />
                </div>
                <div className='modal-input'>
                    <select
                        className='modal-select'
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value='exam'>Bài kiểm tra</option>
                        <option value='lesson'>Bài học</option>
                        <option value='exercise'>Bài tập</option>
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} />
                </div>
                <div className='btn-confirm' onClick={handleAdd}>
                    <button type='button'>Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default ModalAddStorage;
