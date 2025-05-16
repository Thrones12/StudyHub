import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
import dayjs from "dayjs";
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
const ExamResult = {
    GetHistogramData,
};

export { ExamResult };
