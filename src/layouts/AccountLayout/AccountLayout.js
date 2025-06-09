import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./AccountLayout.css";
import { Header, Aside, ProfileOverall } from "../../components";
import styles from "./AccountLayout.module.scss";
import * as MuiIcons from "@mui/icons-material";
import { Tooltip } from "@mui/material";

const AccountLayout = () => {
    const nav = useNavigate();
    return (
        <div className='wrapper'>
            <Tooltip title='Quay lại'>
                <div className={styles.BackButton} onClick={() => nav("/")}>
                    <MuiIcons.KeyboardBackspaceOutlined
                        className={styles.icon}
                    />
                </div>
            </Tooltip>
            <div className='profile-content'>
                <div className='outlet'>
                    <ProfileOverall />
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
