import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
const API = constants.API;
// Fetch data
const FetchNotificationByUser = async (userId, setData) => {
    try {
        const res = await axios.get(`${API}/notification?userId=${userId}`);
        let data = res.data.data;
        setData(data);
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Fetch dữ liệu thất bại");
        }
    }
};
const FetchShowNotificationByUser = async (userId, setData) => {
    try {
        const res = await axios.get(`${API}/notification?userId=${userId}`);
        let data = res.data.data.filter((d) => d.isShow === true);
        setData(data);
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Fetch dữ liệu thất bại");
        }
    }
};
// Set hide
const SetHideNotification = async (id, setData) => {
    try {
        const res = await axios.put(`${API}/notification/hide?id=${id}`);
        let notification = res.data.data; // Notification bị ẩn
        setData((prev) => (prev._id === id ? notification : prev));
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Fetch dữ liệu thất bại");
        }
    }
};
// Set read
const SetReadNotification = async (ids) => {
    if (Array.isArray(ids) && ids.length !== 0)
        try {
            await axios.put(`${API}/notification/read`, { ids });
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Fetch dữ liệu thất bại");
            }
        }
};
// Get read
const GetNewNotificationCount = async (setData) => {
    try {
        const res = await axios.get(`${API}/notification`);
        let data = res.data.data;
        setData(
            data.reduce((total, item) => {
                return item.isRead === false ? total + 1 : total;
            }, 0)
        );
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Fetch dữ liệu thất bại");
        }
    }
};
const Notification = {
    FetchNotificationByUser,
    FetchShowNotificationByUser,
    SetHideNotification,
    SetReadNotification,
    GetNewNotificationCount,
};

export { Notification };
