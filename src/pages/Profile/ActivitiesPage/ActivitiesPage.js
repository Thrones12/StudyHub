import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./ActivitiesPage.css";
import constants from "../../../utils/constants";
import { ActivityTimeline } from "../../../components";

const ActivitiesPage = () => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const [initUser, setInitUser] = useState({});

    // Tab: activities
    const [dateString, setDateString] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${API}/user/get-one?id=${userId}`);
            let data = res.data.data;

            setInitUser(data);
        };
        if (userId) {
            fetchData();
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            const formatted = `Tháng ${month}, ${year}`;

            setDateString(formatted);
        }
    }, [userId, API]);

    return (
        <div className='container'>
            <div className='profile-page'>
                <div className='card'>
                    {/* Begin: card-header */}
                    <div className='card-header'>{dateString}</div>
                    {/* End: card-header */}

                    {/* Begin: card-body */}
                    <div className='card-body'>
                        {/* Begin: row name */}
                        <div className='row'>
                            <ActivityTimeline activities={initUser.histories} />
                        </div>
                        {/* End: row name */}
                    </div>
                    {/* End: card-body */}
                </div>
            </div>
        </div>
    );
};

export default ActivitiesPage;
