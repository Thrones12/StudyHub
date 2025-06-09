import React from "react";
import styles from "./SlideInLeftModal.module.scss";

const SlideInLeftModal = ({ isOpen, onClose, children }) => {
    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <div
                className={`${styles.modalWrapper} ${
                    isOpen ? styles.open : ""
                }`}
            >
                {children}
            </div>
        </>
    );
};

export default SlideInLeftModal;
