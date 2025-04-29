import React, { useContext, useEffect, useState } from "react";
import "./StoragePage.css";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { StorageCard, StorageModalAdd } from "../../components";

const StoragePage = () => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const [storageList, setStorageList] = useState();
    const [showModal, setShowModal] = useState(false);
    const [reload, setReload] = useState(false); // Để reload lại page mỗi khi xóa

    useEffect(() => {
        try {
            const fetchData = async () => {
                const res = await axios.get(`${API}/user/get-one?id=${userId}`);
                let data = res.data.data;

                setStorageList(data.storages);
            };
            if (userId) {
                fetchData();
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đăng nhập thất bại");
            }
        }
    }, [userId, API, reload]);

    const handleAddStorage = async ({ title, type }) => {
        try {
            await axios.post(`${API}/storage`, {
                userId: userId,
                title: title,
                type: type,
            });

            const res = await axios.get(`${API}/user/get-one?id=${userId}`);
            let data = res.data.data;

            setStorageList(data.storages);
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Thêm thất bại");
            }
        }
    };
    const handleDelete = async (storage) => {
        Noti.infoWithYesNo({
            title: "Xác nhận xóa",
            text: `Bạn có muốn xóa <strong>${storage.title}</strong>?`,
            confirmText: "Xóa",
            func: () => deleteItem(storage._id),
        });
    };
    const deleteItem = async (storageId) => {
        try {
            await axios.delete(`${API}/storage?id=${storageId}`);
            setReload(!reload);
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
        <div className='container'>
            <div className='storage-page'>
                <div className='storage-header'>
                    <div className='title'>Danh sách lưu trữ</div>
                    <div className='storage-header-tools'>
                        <button onClick={() => setShowModal(true)}>
                            Tạo mới
                        </button>
                    </div>
                </div>
                <div className='storage-list'>
                    {storageList &&
                        storageList.map((storage, index) => (
                            <StorageCard
                                key={index}
                                storage={storage}
                                handleDelete={() => handleDelete(storage)}
                            />
                        ))}
                </div>
            </div>
            <StorageModalAdd
                onClose={() => setShowModal(false)}
                onSubmit={handleAddStorage}
                showModal={showModal}
            />
        </div>
    );
};

export default StoragePage;
