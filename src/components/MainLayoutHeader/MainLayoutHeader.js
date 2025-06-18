import React, { useContext, useEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import useFetch from "../../hooks/useFetch";
import styles from "./MainLayoutHeader.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { Tooltip } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { TimeFormat } from "../../services/TimeFormat";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const MainLayoutHeader = () => {
    const nav = useNavigate();
    const { user } = useContext(AuthContext);
    // State quản lý modal thông báo
    const [isOpenModal, setIsOpenModal] = useState(false);
    // State quản lý xem có thông báo mới hay không
    const [hasNewNoti, setHasNewNoti] = useState(false);
    // State quản lý số lượng thông báo hiển thị
    // Mặc định hiển thị 10 thông báo
    const [visibleCount, setVisibleCount] = useState(10);
    // State quản lý dữ liệu thông báo
    // Dữ liệu này sẽ được cập nhật khi có thông báo mới từ server
    const [data, setData] = useState([]);
    // Lấy dữ liệu thông báo
    const { data: notifications } = useFetch({
        url: user
            ? `http://localhost:8080/api/notification?userId=${user._id}`
            : null,
        method: "GET",
        deps: [user],
    });
    // Khi có notifications, cập nhật data hiển thị
    useEffect(() => {
        if (notifications) {
            setData(notifications.slice(0, visibleCount));

            setHasNewNoti(notifications.some((noti) => !noti.isRead));
        }
    }, [notifications, visibleCount]);
    // Khi có thông báo mới, cập nhật lại số lượng thông báo hiển thị
    useEffect(() => {
        if (notifications && notifications.length > 0) {
            setData(notifications.slice(0, visibleCount));
            setHasNewNoti(notifications.some((noti) => !noti.isRead));
        }
    }, [notifications, visibleCount]);
    // Khi modal mở, cập nhập lại isRead cho các thông báo
    useEffect(() => {
        const updateAllRead = async () => {
            if (notifications && notifications.length > 0) {
                const updatedNotifications = notifications.map((noti) => ({
                    ...noti,
                    isRead: true,
                }));
                setData(updatedNotifications.slice(0, visibleCount));
                setHasNewNoti(false); // Đặt hasNewNoti về false khi mở modal
                // Gửi yêu cầu cập nhật trạng thái isRead cho server
                try {
                    await axios.put(
                        `http://localhost:8080/api/notification/updateAllRead?userId=${user._id}`
                    );
                } catch (error) {
                    console.error("Error updating notifications:", error);
                }
            }
        };
        if (isOpenModal && notifications) {
            updateAllRead();
        }
    }, [isOpenModal, notifications, user]);
    // Hàm xử lý load thêm thông báo
    // Mỗi lần load thêm sẽ tăng số lượng thông báo hiển thị lên 10
    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10);
    };
    // Hàm chuyển đổi loại thông báo sang tiếng Việt
    // Giả sử loại thông báo có 3 loại: System, Reminder, Comment
    const convertTypeOfNotification = (type) => {
        return type === "System"
            ? "Hệ thống"
            : type === "Reminder"
            ? "Nhắc nhở"
            : "Bình luận";
    };
    // Hàm xử lý khi người dùng click vào thông báo
    const handleNavigate = (noti) => {
        if (!noti.link || noti.link === "") return;

        nav(noti.link);
    };
    // Xử lý tắt modal
    const iconRef = useRef(null);
    const modalRef = useRef(null);
    const handleClickOutside = (event) => {
        if (
            modalRef.current &&
            iconRef.current &&
            !modalRef.current.contains(event.target) &&
            !iconRef.current.contains(event.target)
        ) {
            setIsOpenModal(false);
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (
        <div className={styles.wrapper}>
            <Breadcrumb />
            <div className={styles.controls}>
                <Tooltip title='Liên hệ qua messager'>
                    <a
                        href='https://m.me/61560673299548'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <div className={styles.button}>
                            <img src='/icons/headphone.png' alt='icon' />
                            <p>Hỗ trợ</p>
                        </div>
                    </a>
                </Tooltip>
                <div className={styles.verticaline}></div>
                <Tooltip title='Thông báo'>
                    <div
                        ref={iconRef}
                        className={styles.button}
                        onClick={() => setIsOpenModal(!isOpenModal)}
                    >
                        <FontAwesomeIcon icon={faBell} />
                        {hasNewNoti && <div className={styles.dot}></div>}
                    </div>
                </Tooltip>
            </div>

            <div
                ref={modalRef}
                className={`${styles.Modal} ${isOpenModal ? styles.open : ""}`}
            >
                <div className={styles.Header}>
                    <p>Thông báo</p>
                    <div className={styles.button}>
                        <MuiIcons.Close
                            onClick={() => setIsOpenModal(!isOpenModal)}
                        />
                    </div>
                </div>
                <div className={styles.Body}>
                    {data && data.length > 0 ? (
                        data.map((noti, index) => (
                            <Tooltip
                                key={index}
                                title={noti.link ? "Đi tới" : ""}
                            >
                                <div
                                    className={styles.Notification}
                                    style={{
                                        cursor: noti.link
                                            ? "pointer"
                                            : "default",
                                    }}
                                    onClick={() => handleNavigate(noti)}
                                >
                                    <div className={styles.Type}>
                                        {convertTypeOfNotification(noti.type)}
                                        <span>
                                            {" - "}
                                            {TimeFormat.TimeAgo(noti.createdAt)}
                                        </span>
                                    </div>
                                    <div className={styles.Content}>
                                        {noti.content}
                                    </div>
                                </div>
                            </Tooltip>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            Opps! Bạn không có thông báo nào.
                        </div>
                    )}
                    {notifications && visibleCount < notifications.length && (
                        <button onClick={handleLoadMore}>Xem thêm</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainLayoutHeader;
