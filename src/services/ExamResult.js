import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
const API = constants.API;
// Get histogram data
const GetHistogramData = async (userId, subjectId, setData) => {
    try {
        const res = await axios.get(
            `${API}/examResult?userId=${userId}&subjectId=${subjectId}`
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
const Create = async ({ exam, user, score, duration, answers, chapterId }) => {
    try {
        const res = await axios.post(`${API}/examResult`, {
            exam,
            user,
            score,
            duration,
            answers,
            chapterId,
        });
        return res.data;
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
        return null;
    }
};
const ExamResult = {
    GetHistogramData,
    Create,
};

export { ExamResult };
