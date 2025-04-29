import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "./StudyLayout.css";
import { Header, AsideStudy } from "../../components";

const StudyLayout = () => {
    const [isAsideOpen, setIsAsideOpen] = useState(true);
    const [refreshAside, setRefreshAside] = useState(false);

    const handleAside = () => {
        setIsAsideOpen(!isAsideOpen);
    };

    const triggerRefreshAside = () => {
        setRefreshAside((prev) => !prev); // Toggle để trigger useEffect
    };

    return (
        <div className='wrapper'>
            <Header isOpen={isAsideOpen} handleAside={handleAside} />
            <div className='study-layout-content'>
                <AsideStudy isOpen={isAsideOpen} refresh={refreshAside} />
                <div
                    className='outlet'
                    style={{ paddingLeft: isAsideOpen ? "265px" : "0px" }}
                >
                    <Outlet context={{ triggerRefreshAside, isAsideOpen }} />
                </div>
            </div>
        </div>
    );
};

export default StudyLayout;
