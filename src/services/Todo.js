import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
const API = constants.API;
// Tạo danh mục công việc mới
const Create = async ({ name, userId }) => {
    try {
        await axios.post(`${API}/todo`, { name, userId });
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
// Lưu danh mục công việc
const Update = async ({ id, name, order, tasks }) => {
    try {
        await axios.put(`${API}/todo`, {
            id,
            name,
            order,
            tasks,
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
// Xóa danh mục công việc
const Delete = async ({ todoId, userId }) => {
    try {
        await axios.delete(`${API}/todo?todoId=${todoId}&userId=${userId}`);
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
const Todo = { Create, Update, Delete };

export { Todo };
