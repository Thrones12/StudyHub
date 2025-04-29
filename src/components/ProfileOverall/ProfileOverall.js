import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faEnvelope,
    faPhone,
    faBook,
    faHourglass1,
    faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./ProfileOverall.css";
import ProfileNavbar from "../ProfileNavbar/ProfileNavbar";
import constants from "../../utils/constants";
import { useLocation } from "react-router-dom";

const ProfileOverall = () => {
    const API = constants.API;
    const location = useLocation();
    const pathParts = location.pathname.split("/");
    const activeTab = pathParts[pathParts.length - 1];
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
            <div className='profile-overall'>
                <div className='card'>
                    <div className='card-body' style={{ paddingBottom: 0 }}>
                        <div className='overview'>
                            <div className='image'>
                                <img src={initUser.avatar} alt='avatar' />
                            </div>
                            <div className='information'>
                                <div className='username'>
                                    {initUser.fullname}
                                </div>
                                <div className='info-list'>
                                    <div className='item'>
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        {initUser.email}
                                    </div>
                                    <div className='item'>
                                        <FontAwesomeIcon icon={faPhone} />
                                        {initUser.phone}
                                    </div>
                                    <div className='item'>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        {initUser.address}
                                    </div>
                                </div>
                                <div className='user-statis'>
                                    <div className='item'>
                                        <div className='number'>
                                            <FontAwesomeIcon icon={faBook} />
                                            5019
                                        </div>
                                        <div className='label'>Bài học</div>
                                    </div>
                                    <div className='item'>
                                        <div className='number'>
                                            <FontAwesomeIcon
                                                icon={faFileLines}
                                            />
                                            105
                                        </div>
                                        <div className='label'>
                                            Bài kiểm tra
                                        </div>
                                    </div>
                                    <div className='item'>
                                        <div className='number'>
                                            <FontAwesomeIcon
                                                icon={faHourglass1}
                                            />
                                            40
                                        </div>
                                        <div className='label'>Giờ học</div>
                                    </div>
                                </div>
                            </div>
                            <div className='profile-completion'></div>
                        </div>
                        <ProfileNavbar activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverall;
