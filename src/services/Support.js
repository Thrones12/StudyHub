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
// Create support
const Create = async ({ name, email, title, question }) => {
    try {
        await axios.post(`${API}/support`, {
            name,
            email,
            title,
            question,
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

const Support = { GetAll, Create };

export { Support };
