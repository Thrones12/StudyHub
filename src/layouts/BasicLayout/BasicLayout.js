import React from "react";
import { Outlet } from "react-router-dom";
import "./BasicLayout.css";
import { Header } from "../../components";

const BasicLayout = () => {
    return (
        <div className='wrapper'>
            <Header />
            <div className='main-content'>
                <div className='outlet'>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default BasicLayout;
