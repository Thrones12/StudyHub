import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import "./NotificationPage.css";
import { Notification, TimeFormat } from "../../services";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import constants from "../../utils/constants";
import axios from "axios";

const NotificationPage = () => {
    const API = constants.API;
    const nav = useNavigate();
    const observer = useRef();
    const { userId } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(2);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Fetch thông báo, ban đầu là 20 thông báo
    useEffect(() => {
        if (userId) {
            Notification.FetchNotificationByUser(userId, setNotifications);
        }
    }, [userId]);

    // Click để chuyển trang khi click vào thông báo
    const handleClickNotification = (noti) => {
        if (noti.link.trim() !== "") {
            nav(noti.link);
        }
    };

    // Load thêm thông báo
    const loadMore = async () => {
        const res = await axios.get(
            `${API}/notification?userId=${userId}&page=${page}&limit=10`
        );
        const newData = res.data.data;
        console.log("page: ", page);

        setNotifications([...notifications, ...newData]);

        setPage(page + 1);
        if (newData.length < 10) setHasMore(false); // Hết data
    };

    // Tham chiếu đến thông báo cuối cùng
    const lastNotificationRef = useCallback(
        (node) => {
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    // Hiển thị loading trong 1 giây rồi mới load
                    setLoading(true);
                    setTimeout(() => {
                        loadMore(); // Hàm thực hiện gọi API
                        setLoading(false);
                    }, 1000);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loadMore, hasMore]
    );

    return (
        <div className='container'>
            <div className='notification-page'>
                <div className='header'>Thông báo</div>
                <div className='notification-list'>
                    {notifications.length > 0 ? (
                        notifications.map((noti, index) => {
                            if (index === notifications.length - 1) {
                                return (
                                    <div
                                        ref={lastNotificationRef}
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
                                        {noti.isShow === false && (
                                            <div className='hide'>Ẩn</div>
                                        )}
                                    </div>
                                );
                            }
                            return (
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
                                            {TimeFormat.TimeAgo(noti.createdAt)}
                                        </div>
                                    </div>
                                    {noti.isShow === false && (
                                        <div className='hide'>
                                            <FontAwesomeIcon
                                                icon={faEyeSlash}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className='empty'>Không có thông báo</div>
                    )}
                    {loading && (
                        <div className='spinner-container'>
                            <div className='spinner'></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
