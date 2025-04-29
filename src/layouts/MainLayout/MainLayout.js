import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "./MainLayout.css";
import { Header, Aside } from "../../components";

const MainLayout = () => {
    const [isOpen, setIsOpen] = useState(true);

    const handleAside = () => {
        setIsOpen(!isOpen);
    };
    return (
        <div className='wrapper'>
            <Header isOpen={isOpen} handleAside={handleAside} />
            <div className='main-content'>
                <Aside isOpen={isOpen} />
                <div
                    className='outlet'
                    style={{ paddingLeft: isOpen ? "265px" : "0px" }}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
