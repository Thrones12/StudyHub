import React, { useContext, useEffect, useState } from "react";
import "./ModalNotification.css";
import { AuthContext } from "../../context/AuthContext";
import { Notification, TimeFormat } from "../../services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ModalNotification = ({ isOpen, setIsOpen, setReload }) => {
    const nav = useNavigate();
    const { userId } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [news, setNews] = useState([]); // Notification with isRead = true
    const [olds, setOlds] = useState([]); // Notification with isRead = false
    const [modalShow, setModalShow] = useState("");
    const [modalReload, setModalReload] = useState(false);

    // Fetch thông báo
    useEffect(() => {
        if (userId) {
            Notification.FetchShowNotificationByUser(userId, setNotifications);
            setModalShow("");
        }
    }, [userId, modalReload]);

    // Phân loại thông báo mỗi khi fetch
    useEffect(() => {
        if (notifications && notifications.length > 0) {
            // Set thông báo mới
            let newsNoti = notifications.filter(
                (n) => !TimeFormat.isOlderThanOneHour(n.createdAt)
            );
            setNews(newsNoti);
            // Set thông báo cũ
            let oldNoti = notifications.filter((n) =>
                TimeFormat.isOlderThanOneHour(n.createdAt)
            );
            setOlds(oldNoti);
            // Cập nhập lại toàn bộ thông báo thành đã xem
            if (isOpen) {
                Notification.SetReadNotification(
                    notifications.filter((n) => !n.isRead).map((n) => n._id)
                );
                setReload((prev) => !prev);
            }
        }
    }, [notifications, isOpen]);

    // Click để chuyển trang khi click vào thông báo
    const handleClickNotification = (noti) => {
        if (noti.link.trim() !== "") {
            setIsOpen(false);
            nav(noti.link);
        }
    };
    // Click để mở modal để ẩn thông báo
    const handleClickToggle = (e, notiId) => {
        e.stopPropagation();
        if (modalShow === notiId) setModalShow("");
        else setModalShow(notiId);
    };
    // Click để ẩn thông báo
    const handleClickModal = (e, noti) => {
        e.stopPropagation();
        Notification.SetHideNotification(noti._id, setNotifications);
        setModalReload(!modalReload);
    };

    return (
        <div className={`modal-notification ${isOpen ? "open" : ""}`}>
            <div className='header'>Thông báo</div>
            <div className='notification-list'>
                {notifications.length > 0 ? (
                    <>
                        {news.length > 0 && (
                            <>
                                <div className='label'>Mới</div>
                                {news.map((noti, index) => (
                                    <div
                                        key={`read-${index}`}
                                        className='notification'
                                        onClick={() =>
                                            handleClickNotification(noti)
                                        }
                                    >
                                        <div className='icon'>
                                            <FontAwesomeIcon icon={faBell} />
                                        </div>
                                        <div className='info'>
                                            <div className='content'>
                                                {noti.content}
                                            </div>
                                            <div className='time'>
                                                {TimeFormat.TimeAgo(
                                                    noti.createdAt
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className='toggle'
                                            onClick={(e) =>
                                                handleClickToggle(e, noti._id)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faEllipsis}
                                            />
                                        </div>
                                        <div
                                            className={`modal ${
                                                modalShow === noti._id
                                                    ? "show"
                                                    : ""
                                            }`}
                                            onClick={(e) =>
                                                handleClickModal(e, noti)
                                            }
                                        >
                                            Ẩn thông báo
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {olds.length > 0 && (
                            <>
                                <div className='label'>Trước đó</div>
                                {olds.map((noti, index) => (
                                    <div
                                        key={`unread-${index}`}
                                        className='notification'
                                        onClick={() =>
                                            handleClickNotification(noti)
                                        }
                                    >
                                        <div className='icon'>
                                            <FontAwesomeIcon icon={faBell} />
                                        </div>
                                        <div className='info'>
                                            <div className='content'>
                                                {noti.content}
                                            </div>
                                            <div className='time'>
                                                {TimeFormat.TimeAgo(
                                                    noti.createdAt
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className='toggle'
                                            onClick={(e) =>
                                                handleClickToggle(e, noti._id)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faEllipsis}
                                            />
                                        </div>
                                        <div
                                            className={`modal ${
                                                modalShow === noti._id
                                                    ? "show"
                                                    : ""
                                            }`}
                                            onClick={(e) =>
                                                handleClickModal(e, noti)
                                            }
                                        >
                                            Ẩn thông báo
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        <div
                            className='link'
                            onClick={() => {
                                setIsOpen(false);
                                nav("/notification");
                            }}
                        >
                            Xem tất cả
                        </div>
                    </>
                ) : (
                    <div className='empty'>Không có thông báo</div>
                )}
            </div>
        </div>
    );
};

export default ModalNotification;
