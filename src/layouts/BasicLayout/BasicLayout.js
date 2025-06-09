import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./BasicLayout.module.scss";

const BasicLayout = () => {
    return (
        <div className={styles.Wrapper}>
            <Outlet />
        </div>
    );
};

export default BasicLayout;
