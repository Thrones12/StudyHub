import React, { useEffect, useRef, useState } from "react";
import "./ModalMoreTask.css";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

const ModalMoreTask = ({ openTask, setIsOpen, tasks }) => {
    const compRef = useRef();
    const [date, setDate] = useState("");
    const weekdays = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
    ];

    useEffect(() => {
        let day = dayjs(tasks[0].date);
        const weekday = weekdays[day.day()]; // day() trả 0 (Chủ nhật) đến 6 (Thứ bảy)
        const dateString = day.format("DD/MM/YYYY"); // không có 0 phía trước

        setDate(`${weekday}, ${dateString}`);
    }, [tasks]);

    const handleClickOutside = (e) => {
        if (compRef.current && !compRef.current.contains(e.target)) {
            setIsOpen(-1);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTaskColor = (task) => {
        if (task.completed) return "#4CAF50"; // ✅ Đã hoàn thành (xanh lá)

        switch (task.priority) {
            case "low":
                return "#2196F3"; // 🟢 Ưu tiên thấp (xanh dương)
            case "medium":
                return "#FFC107"; // 🟡 Trung bình (vàng)
            case "high":
                return "#FF9800"; // 🟠 Cao (cam)
            case "urgent":
                return "#F44336"; // 🔴 Khẩn cấp (đỏ)
            default:
                return "#BDBDBD"; // ⚪️ Mặc định (xám nhạt)
        }
    };
    return (
        <div
            className={`modal-more-task show`}
            ref={compRef}
            key={date}
            onClick={(e) => e.stopPropagation()}
        >
            <div className='modal'>
                <div className='header'>
                    {date}
                    <FontAwesomeIcon
                        icon={faClose}
                        onClick={() => setIsOpen(-1)}
                    />
                </div>
                <div className='modal-task-list'>
                    {tasks.length > 0 &&
                        tasks.map((task, index) => (
                            <div
                                key={index}
                                className='more-task-item'
                                style={{
                                    backgroundColor: getTaskColor(task),
                                }}
                                onClick={() => {
                                    setIsOpen(-1);
                                    openTask(task);
                                }}
                            >
                                {task.title ? task.title : "(Không có tiêu đề)"}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ModalMoreTask;
