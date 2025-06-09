import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
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
const AddSearch = async ({ userId, title, info, link }) => {
    try {
        await axios.post(`${API}/user/search/${userId}`, { title, info, link });
        return true;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Thêm dữ liệu thất bại");
        }
        return false;
    }
};
// Thêm hình ảnh vào custom theme của người dùng
const AddImageToTheme = async (id, file) => {
    try {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("image", file);
        await axios.put(`${API}/user/theme`, formData);
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Thêm hình ảnh thất bại");
        }
    }
};
// Xóa hình ảnh trong custom theme của người dùng
const DeleteImageOfTheme = async (id, image) => {
    try {
        await axios.post(`${API}/user/theme`, { id, image });
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Thêm hình ảnh thất bại");
        }
    }
};
// Xử lý lưu trữ bài kiểm tra
async function Save({ userId, examId }) {
    try {
        let res = await axios.put(`${API}/user/save`, { userId, examId });
        if (res.data.isSaved) {
            Noti.success("Đã thêm vào mục lưu trữ");
        } else {
            Noti.success("Đã xóa khỏi mục lưu trữ");
        }
        return res.data;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Lưu trữ thất bại");
        }
        return null;
    }
}
// Xử lý yêu thích bài học
async function Like({ userId, lessonId }) {
    try {
        let res = await axios.put(`${API}/user/like`, { userId, lessonId });
        if (res.data.isLiked) {
            Noti.success("Đã thêm vào mục yêu thích");
        } else {
            Noti.success("Đã xóa khỏi mục yêu thích");
        }
        return res.data;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error("Lưu trữ thất bại");
        }
        return null;
    }
}
const User = {
    GetUser,
    GetLearningHour,
    GetProgressData,
    GetAverageScore,
    AddSearch,
    AddImageToTheme,
    DeleteImageOfTheme,
    Save,
    Like,
};

export { User };
