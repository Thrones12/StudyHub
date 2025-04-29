import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "./ProfileLayout.css";
import { Header, Aside, ProfileOverall } from "../../components";

const ProfileLayout = () => {
    const [isAsideOpen, setIsAsideOpen] = useState(true);
    const handleAside = () => {
        setIsAsideOpen(!isAsideOpen);
    };
    return (
        <div className='wrapper'>
            <Header isOpen={isAsideOpen} handleAside={handleAside} />
            <div className='profile-content'>
                <Aside isOpen={isAsideOpen} />
                <div
                    className='outlet'
                    style={{ paddingLeft: isAsideOpen ? "265px" : "0px" }}
                >
                    <ProfileOverall />
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
