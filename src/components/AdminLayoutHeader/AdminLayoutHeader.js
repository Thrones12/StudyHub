import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import styles from "./AdminLayoutHeader.module.scss";
import * as MuiIcons from "@mui/icons-material";

const AdminLayoutHeader = ({ hasAdd, openModalAdd }) => {
    return (
        <div className={styles.wrapper}>
            <Breadcrumb />
            {hasAdd && (
                <div className={styles.controls}>
                    <div className={styles.button} onClick={openModalAdd}>
                        <MuiIcons.Add />
                        <p>Tạo mới</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayoutHeader;
