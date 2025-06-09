import React, { useContext, useEffect, useState } from "react";
import {
    startOfMonth,
    startOfWeek,
    addDays,
    format,
    isSameMonth,
    isToday,
    isSameDay,
} from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import "./Calendar.css";
import dayjs from "dayjs";
import { Task } from "../../services";
import { AuthContext } from "../../context/AuthContext";
import ModalTask from ".././ModalTask/ModalTask";
import ModalMoreTask from "../ModalMoreTask/ModalMoreTask";

const MAX_TASKS_DISPLAY = 3; // Số task tối đa hiển thị
const MAX_DAY = 42; // 6 row, 7 column
const Calendar = ({ date, tasks, openTask }) => {
    const { userId } = useContext(AuthContext);
    const [isOpenMoreTask, setIsOpenMoreTask] = useState(-1);

    let daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    let [days, setDays] = useState([]);
    // Khởi tạo ngày trong tháng
    useEffect(() => {
        // Tạo 1 array các ngày trong calendar
        let startMonth = startOfMonth(date);
        let startWeek = startOfWeek(startMonth);
        let day = startWeek;
        let tempDays = [];
        while (tempDays.length < MAX_DAY) {
            tempDays.push(day);
            day = addDays(day, 1);
        }
        setDays([...tempDays]);
    }, [date]);

    const getTaskOfDay = (day) => {
        const target = new Date(day);
        target.setHours(0, 0, 0, 0);

        return tasks
            .filter((task) => {
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                // Trường hợp có repeat
                if (task.repeat && task.repeat !== "none") {
                    switch (task.repeat) {
                        case "daily":
                            return target >= dueDate;

                        case "weekly":
                            return (
                                target >= dueDate &&
                                target.getDay() === dueDate.getDay()
                            );

                        case "monthly":
                            return (
                                target >= dueDate &&
                                target.getDate() === dueDate.getDate()
                            );

                        case "yearly":
                            return (
                                target >= dueDate &&
                                target.getDate() === dueDate.getDate() &&
                                target.getMonth() === dueDate.getMonth()
                            );

                        default:
                            return false;
                    }
                }

                // Trường hợp không lặp (repeat === "none" hoặc không có)
                const endDate = new Date(task.endDate);
                endDate.setHours(0, 0, 0, 0);
                return target >= dueDate && target <= endDate;
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    };

    const openMoreTask = (e, index) => {
        e.stopPropagation();
        setIsOpenMoreTask(index);
    };
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
        <div className='calendar'>
            <div className='calendar-header'>
                {daysOfWeek.map((day, index) => (
                    <div key={index} className='calendar-header-item'>
                        {day}
                    </div>
                ))}
            </div>

            <div className='calendar-grid'>
                {tasks &&
                    days.length > 0 &&
                    days.map((day, index) => {
                        let taskOfDay = getTaskOfDay(day);
                        return (
                            <div
                                key={index}
                                className={`calendar-day ${
                                    isSameMonth(day, date) ? "" : "disabled"
                                } ${isToday(day) ? "today" : ""}`}
                            >
                                <div className='date-number'>
                                    {format(day, "d")}
                                </div>
                                {taskOfDay.length <= MAX_TASKS_DISPLAY ? (
                                    taskOfDay.map((task, index) => (
                                        <div
                                            key={index}
                                            className={`task-item`}
                                            style={{
                                                backgroundColor:
                                                    getTaskColor(task),
                                            }}
                                            onClick={() => openTask(task)}
                                        >
                                            {task.title
                                                ? task.title
                                                : "(Không có tiêu đề)"}
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {taskOfDay
                                            .slice(0, 2)
                                            .map((task, index) => (
                                                <div
                                                    key={index}
                                                    className={`task-item ${
                                                        task.completed === true
                                                            ? "completed"
                                                            : ""
                                                    }`}
                                                    onClick={(e) =>
                                                        openTask(e, task, day)
                                                    }
                                                >
                                                    {task.title
                                                        ? task.title
                                                        : "(Không có tiêu đề)"}
                                                </div>
                                            ))}
                                        <div
                                            className='task-item more-task'
                                            onClick={(e) =>
                                                openMoreTask(e, index)
                                            }
                                        >
                                            + {taskOfDay.length - 2} công việc
                                        </div>
                                        {/* BEGIN: More Task */}
                                        {isOpenMoreTask === index && (
                                            <ModalMoreTask
                                                setIsOpen={setIsOpenMoreTask}
                                                tasks={taskOfDay}
                                                openTask={openTask}
                                            />
                                        )}
                                        {/* END: More Task */}
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default Calendar;
