import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
const API = constants.API;
// Get all course
const GetAll = async (setData) => {
    try {
        const res = await axios.get(`${API}/course`);
        setData(res.data.data);
    } catch (err) {
        if (err.response && err.response.data?.message) {
            Noti.error(err.response.data.message);
        } else {
            Noti.error(err.message || err);
        }
    }
};

const Course = { GetAll };

export { Course };
