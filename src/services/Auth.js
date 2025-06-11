import axios from "axios";
import Noti from "../utils/Noti";
import constants from "../utils/constants";
const API = constants.API;
// Đăng nhập - Kiểm tra thông tin đăng nhập có đúng không
const Login = async ({ username, password }) => {
    try {
        console.log({ username, password });
    } catch (err) {
        throw err;
    }
};

const AuthSerice = { Login };

export { AuthSerice };
