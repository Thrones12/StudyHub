import React, { useEffect } from "react";
import axios from "axios";
import constants from "../../utils/constants";
import "./HomePage.css";

const HomePage = () => {
    const API = constants.API;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/user`);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };

        fetchData();
    }, [API]);
    return (
        <div>
            <h4>Chương trình</h4>
        </div>
    );
};

export default HomePage;
