import React from "react";
import "./EmptyData.css";
import { useNavigate } from "react-router-dom";

const EmptyData = ({ btnText, navPath }) => {
    const nav = useNavigate();
    return (
        <div className='empty-data'>
            <p className='empty-text'>Không có dữ liệu</p>
            {btnText && navPath && (
                <button className='empty-btn' onClick={() => nav(`${navPath}`)}>
                    {btnText}
                </button>
            )}
        </div>
    );
};

export default EmptyData;
