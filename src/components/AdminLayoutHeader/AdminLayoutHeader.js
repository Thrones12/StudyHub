import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import styles from "./AdminLayoutHeader.module.scss";
import * as MuiIcons from "@mui/icons-material";

const AdminLayoutHeader = ({ hasAdd, openModalAdd, openNotiModal }) => {
    return (
        <div className={styles.wrapper}>
            <Breadcrumb />
            <div className={styles.controls}>
                {openNotiModal && (
                    <div
                        className={styles.button}
                        onClick={() => openNotiModal(true)}
                    >
                        <p>Thông báo</p>
                    </div>
                )}
                {hasAdd && (
                    <div className={styles.button} onClick={openModalAdd}>
                        <MuiIcons.Add />
                        <p>Tạo mới</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLayoutHeader;
