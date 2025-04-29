import React, { useContext, useEffect, useState } from "react";
import constants from "../../utils/constants";
import { AuthContext } from "../../context/AuthContext";
import "./ModalSave.css";
import axios from "axios";
import Noti from "../../utils/Noti";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

const ModalSave = ({
    storageType,
    isShow,
    setIsShow,
    itemId,
    setIsShowModalAdd,
}) => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const [storages, setStorages] = useState();
    const [refresh, setRefresh] = useState(false);

    // Fetch dữ liệu lesson, phụ thuộc vào user
    useEffect(() => {
        const fetchData = async () => {
            try {
                let type;
                if (storageType === "exam") {
                    type = "exam";
                } else if (storageType === "exercise") {
                    type = "exercise";
                } else {
                    type = "lesson";
                }
                const res = await axios.get(
                    `${API}/user/get-storages?id=${userId}&type=${type}`
                );
                let data = res.data.data;

                setStorages(data);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Lỗi khi storage");
                }
            }
        };

        fetchData();
    }, [API, userId, refresh, isShow]);
    const checkSaved = (storage) => {
        return storage.items.some((item) => item._id === itemId);
    };
    const handleSave = async (storage) => {
        try {
            if (storage.items.some((item) => item._id === itemId)) {
                await axios.put(`${API}/storage/un-save`, {
                    storageId: storage._id,
                    itemId: itemId,
                });
                setRefresh(!refresh);
            } else {
                await axios.put(`${API}/storage/save`, {
                    storageId: storage._id,
                    itemId: itemId,
                });
                setRefresh(!refresh);
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Lỗi khi storage");
            }
        }
    };

    const handleOpenModalAdd = () => {
        setIsShow(false);
        setIsShowModalAdd(true);
    };
    return (
        <div className={`modal-save ${isShow ? "show" : ""}`}>
            <div
                className='modal-overlay'
                onClick={() => setIsShow(false)}
            ></div>
            <div className='modal'>
                <div className='header'>
                    Lưu vào ...
                    <FontAwesomeIcon
                        icon={faClose}
                        onClick={() => setIsShow(false)}
                    />
                </div>
                <div className='storages'>
                    {storages &&
                        storages.map((s, i) => (
                            <div
                                key={i}
                                className='storage-item'
                                onClick={() => handleSave(s)}
                            >
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className={`${
                                        checkSaved(s) ? "saved" : ""
                                    }`}
                                />
                                {s.title}
                            </div>
                        ))}
                </div>
                <div className='btn-add-storage' onClick={handleOpenModalAdd}>
                    <button>Danh sách mới</button>
                </div>
            </div>
        </div>
    );
};

export default ModalSave;
