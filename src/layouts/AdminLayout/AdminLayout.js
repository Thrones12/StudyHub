import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import { AdminLayoutToolbar } from "../../components";

const AdminLayout = () => {
    const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
    return (
        <div className={styles.wrapper}>
            <AdminLayoutToolbar
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

export default AdminLayout;
