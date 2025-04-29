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
import ModalNewTask from "../ModalNewTask/ModalNewTask";
import { Task } from "../../services";
import { AuthContext } from "../../context/AuthContext";

const MAX_TASKS_DISPLAY = 3; // Số task tối đa hiển thị
const MAX_DAY = 42; // 6 row, 7 column
const Calendar = ({ date, setReload }) => {
    const { userId } = useContext(AuthContext);
    const [modalDate, setModalDate] = useState(dayjs());
    const [isOpenModalNewTask, setIsOpenModalNewTask] = useState(false);
    const [tasks, setTasks] = useState();
    const [selectTask, setSelectTask] = useState(null);

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

    // Get công việc trong tháng
    useEffect(() => {
        Task.GetTaskOfMonth(userId, dayjs(date), setTasks);
    }, [date]);

    const getTaskOfDay = (day) => {
        let data = [];
        data = tasks
            .filter((task) => isSameDay(task.date, day))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort tăng dần
        return data;
    };
    const openTask = (e, task, day) => {
        e.stopPropagation();
        setSelectTask(task);
        setModalDate(dayjs(day));
        setIsOpenModalNewTask(true);
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
                                onClick={() => {
                                    setModalDate(dayjs(day));
                                    setIsOpenModalNewTask(true);
                                }}
                            >
                                <div className='date-number'>
                                    {format(day, "d")}
                                </div>
                                {taskOfDay.length <= MAX_TASKS_DISPLAY ? (
                                    taskOfDay.map((task, index) => (
                                        <div
                                            key={index}
                                            className='task-item'
                                            onClick={(e) =>
                                                openTask(e, task, day)
                                            }
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
                                                    className='task-item'
                                                    onClick={(e) =>
                                                        openTask(e, task, day)
                                                    }
                                                >
                                                    {task.title
                                                        ? task.title
                                                        : "(Không có tiêu đề)"}
                                                </div>
                                            ))}
                                        <div className='more-task'>
                                            {taskOfDay.length - 2} công việc nữa
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>
            <ModalNewTask
                initDate={modalDate}
                isOpen={isOpenModalNewTask}
                setIsOpen={setIsOpenModalNewTask}
                setReload={setReload}
                task={selectTask}
            />
        </div>
    );
};

export default Calendar;
