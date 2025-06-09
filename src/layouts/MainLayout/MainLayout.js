import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Header, Aside, MainLayoutToolbar } from "../../components";

const MainLayout = () => {
    const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
    return (
        <div className={styles.wrapper}>
            <MainLayoutToolbar
                isCollapsed={isToolbarCollapsed}
                setIsCollapsed={setIsToolbarCollapsed}
            />
            <div
                className={styles.outlet}
                style={{ paddingLeft: isToolbarCollapsed ? "60px" : "240px" }}
            >
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
