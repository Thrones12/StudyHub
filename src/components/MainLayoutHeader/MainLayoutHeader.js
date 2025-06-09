import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import useFetch from "../../hooks/useFetch";
import styles from "./MainLayoutHeader.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { Tooltip } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { TimeFormat } from "../../services/TimeFormat";
import { useNavigate } from "react-router-dom";

const MainLayoutHeader = () => {
    const nav = useNavigate();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const [data, setData] = useState([]);
    // Lấy dữ liệu thông báo
    const { data: notifications } = useFetch({
        url: `http://localhost:8080/api/notification`,
        method: "GET",
    });
    // Khi có notifications, cập nhật data hiển thị
    useEffect(() => {
        if (notifications) {
            setData(notifications.slice(0, visibleCount));
        }
    }, [notifications, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10);
    };
    const convertTypeOfNotification = (type) => {
        return type === "System"
            ? "Hệ thống"
            : type === "Reminder"
            ? "Nhắc nhở"
            : "Bình luận";
    };
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
                    {data &&
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
                        ))}
                    {notifications && visibleCount < notifications.length && (
                        <button onClick={handleLoadMore}>Xem thêm</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainLayoutHeader;
