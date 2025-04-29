import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./StatisPage.css";
import constants from "../../../utils/constants";
const StatisPage = () => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const [initUser, setInitUser] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${API}/user/get-one?id=${userId}`);
            let data = res.data.data;

            setInitUser(data);
        };
        if (userId) {
            fetchData();
        }
    }, [userId, API]);

    return (
        <div className='container'>
            <div className='profile-page'>
                {/* Begin: statis card */}
                <div className='card'>
                    {/* Begin: card-header */}
                    <div className='card-header'>Thống kê học tập</div>
                    {/* End: card-header */}

                    {/* Begin: card-body */}
                    <div className='card-body'>
                        {/* Begin: row name */}
                        <div className='row'></div>
                        {/* End: row name */}
                    </div>
                    {/* End: card-body */}
                </div>
                {/* End: statis card */}
            </div>
        </div>
    );
};

export default StatisPage;
