import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import dayjs from "dayjs";
const API = constants.API;
// Get task of month
const GetTaskOfMonth = async (userId, initDate, setData) => {
    try {
        if (initDate && dayjs(initDate).isValid()) {
            let date = dayjs(initDate).startOf("month").toISOString();
            const res = await axios.get(
                `${API}/task?userId=${userId}&date=${date}`
            );
            setData(res.data.data);
        }
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
    }
};

// Create
const Create = async ({ userId, title, loop, description, date }) => {
    try {
        await axios.post(`${API}/task`, {
            userId: userId,
            title: title,
            loop: loop,
            description: description,
            date: date,
        });
        Noti.success("Thêm công việc thành công");
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Thêm dữ liệu thất bại");
        }
    }
};

// Update
const Update = async ({ id, title, loop, description, date }) => {
    try {
        await axios.put(`${API}/task`, {
            id: id,
            title: title,
            loop: loop,
            description: description,
            date: date,
        });
        Noti.success("Cập nhập thành công");
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Cập nhập dữ liệu thất bại");
        }
    }
};
const Task = { GetTaskOfMonth, Create, Update };

export { Task };
