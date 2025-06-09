import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
const API = constants.API;
// Tạo phiên học mới
const Create = async ({ userId, title, targetTime }) => {
    try {
        await axios.post(`${API}/session`, { userId, title, targetTime });
        return true;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
        return false;
    }
};
// Lưu phiên học
const Update = async ({ id, title, spentTime, targetTime, isDone }) => {
    try {
        await axios.put(`${API}/session`, {
            id,
            title,
            spentTime,
            targetTime,
            isDone,
        });
        return true;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
        return false;
    }
};
// Xóa phiên học
const Delete = async (id) => {
    try {
        await axios.delete(`${API}/session/${id}`);
        return true;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
        return false;
    }
};

const Session = { Create, Update, Delete };

export { Session };
