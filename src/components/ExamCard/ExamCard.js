import React, { useEffect, useState } from "react";
import "./ExamCard.css";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ExamCard = ({ item }) => {
    const API = constants.API;
    const nav = useNavigate();
    const [courseTitle, setCourseTitle] = useState("");
    const [subjectTitle, setSubjectTitle] = useState("");

    // Fetch title
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${API}/exam/get-title?id=${item._id}`
                );
                let data = res.data.data;
                setCourseTitle(data.courseTitle);
                setSubjectTitle(data.subjectTitle);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Tải trang thất bại");
                }
            }
        };
        fetchData();
    }, [API, courseTitle, subjectTitle]);

    const formatTimeToMinute = (seconds) => {
        const minutes = Math.round(seconds / 60); // dùng round để làm tròn
        return `${minutes} phút`;
    };
    function formatAttemptCount(number) {
        if (number >= 1_000_000_000) {
            return (
                (number / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ"
            );
        }
        if (number >= 1_000_000) {
            return (number / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Tr";
        }
        if (number >= 1_000) {
            return (number / 1_000).toFixed(1).replace(/\.0$/, "") + " N";
        }
        return number.toString();
    }
    function formatTimeAgo(inputDate) {
        const date = new Date(inputDate);
        const now = new Date();
        const diffMs = now - date;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years >= 1) return `${years} năm trước`;
        if (months >= 1) return `${months} tháng trước`;
        if (weeks >= 1) return `${weeks} tuần trước`;
        if (days >= 1) return `${days} ngày trước`;
        if (hours >= 1) return `${hours} giờ trước`;
        if (minutes >= 1) return `${minutes} phút trước`;
        return `Vừa xong`;
    }
    return (
        <div
            className={`exam-card ${item.level}`}
            onClick={() => nav(`/exam/${item._id}`)}
        >
            {/* BEGIN: Main info */}
            <div className='main-info'>
                <div className='title-wrapper'>
                    <div className='title'>{item.title}</div>
                    <div className='sub-title'>
                        {courseTitle} - {subjectTitle}
                    </div>
                </div>
                <div className='exam-info'>
                    <div className='info-item'>
                        Số lượng câu hỏi:{" "}
                        <span>{item.questions.length} câu</span>
                    </div>
                    <div className='info-item'>
                        Thời gian làm bài:{" "}
                        <span>{formatTimeToMinute(item.duration)}</span>
                    </div>
                </div>
            </div>
            {/* END: Main info */}
            {/* BEGIN: Sub info */}
            <div className='sub-info'>
                <div className='info'>
                    {formatAttemptCount(item.attemptCount)} lượt làm
                    {" - "}
                    {formatTimeAgo(item.createdAt)}
                </div>
                <div className='level'>
                    {item.level === "easy"
                        ? "Dễ"
                        : item.level === "medium"
                        ? "Trung bình"
                        : "Khó"}
                </div>
            </div>
            {/* END: Sub info */}
        </div>
    );
};

export default ExamCard;
