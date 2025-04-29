import React, { useEffect } from "react";
import { VideoThumbnail } from "..";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import "./StorageLessonCard.css";
import Noti from "../../utils/Noti";
import axios from "axios";
import constants from "../../utils/constants";

const StorageLessonCard = ({ isDone, item, storage, setReload }) => {
    const API = constants.API;
    const handleDelete = async () => {
        Noti.infoWithYesNo({
            title: "Xác nhận xóa",
            text: `Bạn có muốn xóa <strong>${item.title}</strong> khỏi <strong>${storage.title}</strong>?`,
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
        <div className='storage-lesson-card'>
            <button className='delete-btn' onClick={handleDelete}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <div className='video'>
                <VideoThumbnail videoUrl={item.video.url} />
            </div>
            <div className='lesson-title'>{item.title}</div>
            <div className='seperator'></div>
            <div className={`footer ${isDone ? "done" : "not-done"}`}>
                <div className='text'>
                    <FontAwesomeIcon icon={faCircleCheck} />
                    {isDone ? "Đã hoàn thành" : "Chưa hoàn thành"}
                </div>
                {isDone ? (
                    <button className='btn btn-gray'>Xem lại</button>
                ) : (
                    <button className='btn btn-green'>Tiếp tục</button>
                )}
            </div>
        </div>
    );
};

export default StorageLessonCard;
