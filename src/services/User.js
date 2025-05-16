import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
import dayjs from "dayjs";
const API = constants.API;
// Get user
const GetUser = async (userId, setData) => {
    try {
        const res = await axios.get(`${API}/user/get-one?id=${userId}`);
        setData(res.data.data);
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
    }
};
// Get task of month
const GetLearningHour = async (userId, courseId, month, year, setData) => {
    try {
        if (month && year) {
            const res = await axios.get(
                `${API}/user/get-learning-hour?id=${userId}&month=${month}&year=${year}`
            );
            if (res.data.data) {
                let data = res.data.data.courses.find(
                    (course) => course.courseId === courseId
                );

                setData(data.subjects);
            } else {
                setData(null);
            }
        }
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
    }
};
// Get progress data
const GetProgressData = async (userId, setData) => {
    try {
        const res = await axios.get(`${API}/user/get-progress?id=${userId}`);
        setData(res.data.data);
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
    }
};
// Get progress data
const GetAverageScore = async (userId, courseId, setData) => {
    try {
        const res = await axios.get(
            `${API}/user/get-average-score?id=${userId}&courseId=${courseId}`
        );
        setData(res.data.data);
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
// Delete
const Delete = async (id) => {
    try {
        await axios.delete(`${API}/task?id=${id}`);
        Noti.success("Xóa thành công");
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Xóa dữ liệu thất bại");
        }
    }
};
const User = {
    GetUser,
    GetLearningHour,
    GetProgressData,
    GetAverageScore,
    Create,
    Update,
    Delete,
};

export { User };
