import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faAngleLeft,
    faAngleRight,
    faPlus,
    faClose,
    faCheckCircle as faCheckedCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faClock, faEdit, faCircle } from "@fortawesome/free-regular-svg-icons";

import dayjs from "dayjs";
import {
    LocalizationProvider,
    TimePicker,
    DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Select, MenuItem } from "@mui/material";
import { Howl } from "howler";
import "./OldCalendarPage.css";
import Calendar from "../../components/Calendar/Calendar";

const tempTaskList = [
    {
        _id: "1",
        title: "Công việc 1",
        date: "2025-03-28T12:00:00.000Z",
        loop: 0,
        description: "Mô tả 1",
        isDone: false,
    },
    {
        _id: "2",
        title: "Công việc 2",
        date: "2025-03-28T12:00:00.000Z",
        loop: 1,
        description: "Mô tả 2",
        isDone: true,
    },
    {
        _id: "3",
        title: "Công việc 3",
        date: "2025-03-26T12:00:00.000Z",
        loop: 0,
        description: "Mô tả 3",
        isDone: false,
    },
    {
        _id: "4",
        title: "Công việc 4",
        date: "2025-03-26T12:00:00.000Z",
        loop: 0,
        description: "Mô tả 4",
        isDone: true,
    },
    {
        _id: "5",
        title: "Công việc 5",
        date: "2025-03-29T12:00:00.000Z",
        loop: 0,
        description: "Mô tả 5",
        isDone: false,
    },
    {
        _id: "6",
        title: "Công việc 6",
        date: "2025-03-29T12:00:00.000Z",
        loop: 0,
        description: "Mô tả 6",
        isDone: true,
    },
];

const OldCalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [isShowNewModal, setIsShowNewModal] = useState(false);
    const [isShowEditModal, setIsShowEditModal] = useState(false);

    const [taskId, setTaskId] = useState("");
    const [taskTitle, setTaskTitle] = useState("");
    const [loopOption, setLoopOption] = useState(0);
    const [taskDescription, setTaskDescription] = useState("");

    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [missedTasks, setMissedTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);

    const startMonth = currentDate.startOf("month");
    const endMonth = currentDate.endOf("month");

    useEffect(() => {
        handleSetTask();
    }, [tasks]);
    const handleSetTask = () => {
        setTodayTasks(
            tasks.filter((task) => dayjs(task.date).isSame(dayjs(), "day"))
        );
        setMissedTasks(
            tasks.filter(
                (task) =>
                    dayjs(task.date).isBefore(dayjs(), "day") && !task.isDone
            )
        );
        setUpcomingTasks(
            tasks.filter((task) => dayjs(task.date).isAfter(dayjs(), "day"))
        );
    };
    const handleToday = () => {
        setCurrentDate(dayjs());
    };
    const handlePrevMonth = () => {
        setCurrentDate(startMonth.subtract(1, "day"));
    };
    const handleNextMonth = () => {
        setCurrentDate(endMonth.add(1, "day"));
    };
    const handleCloseNewModal = () => {
        // Làm mới nội dung modal
        setCurrentDate(dayjs());
        setTaskTitle("");
        setLoopOption(0);
        setTaskDescription("");
        setIsShowNewModal(false);
    };
    const handleOpenNewModal = (date) => {
        console.log(dayjs.isDayjs(date));

        setCurrentDate(date);
        setIsShowNewModal(true);
        setTaskTitle("");
        setLoopOption(0);
        setTaskDescription("");
    };
    const handleCloseEditModal = () => {
        // Làm mới nội dung modal
        setCurrentDate(dayjs());
        setTaskTitle("");
        setLoopOption(0);
        setTaskDescription("");
        setIsShowEditModal(false);
    };
    const handleOpenTask = (event, { _id, title, date, loop, description }) => {
        event.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
        setIsShowEditModal(true);
        // Nhập nội dung vào modal
        setCurrentDate(dayjs(date));
        setTaskId(_id);
        setTaskTitle(title);
        setLoopOption(loop);
        setTaskDescription(description);
    };
    // set task done or not
    const handleToggleTask = (task) => {
        task.isDone = !task.isDone;
        setTasks([...tasks]);

        const howl = new Howl({
            src: "/sounds/ting.mp3",
        });
        howl.play();
    };
    const createNewTask = () => {
        const newTask = {
            _id: getNewTaskId(tasks),
            title: taskTitle,
            date: currentDate.toISOString(),
            loop: loopOption,
            description: taskDescription,
            isDone: false,
        };

        setTasks((prevTasks) => [...prevTasks, newTask]); // Cập nhật state đúng cách
        handleCloseNewModal();
    };
    const editTask = (taskId) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task._id === taskId
                    ? {
                          ...task,
                          title: taskTitle,
                          date: currentDate.toISOString(),
                          loop: loopOption,
                          description: taskDescription,
                      }
                    : task
            )
        );
        handleCloseEditModal();
    };
    const deleteTask = (taskId) => {
        setTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== taskId)
        );
        handleCloseEditModal();
    };
    const getNewTaskId = (tasks) => {
        if (tasks.length === 0) return 1; // Nếu danh sách rỗng, bắt đầu từ 1

        const maxId = Math.max(...tasks.map((task) => task._id)); // Lấy _id lớn nhất
        return maxId + 1; // Tăng _id lên 1
    };
    return (
        <div className='calendar-page-wrapper'>
            <div className='calendar-content'>
                <div className='calendar-tool'>
                    <div className='today-btn' onClick={handleToday}>
                        Hôm nay
                    </div>
                    <div className='handle-month'>
                        <div className='handle-btn' onClick={handlePrevMonth}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </div>
                        <div className='handle-btn' onClick={handleNextMonth}>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </div>
                    </div>
                    <div className='current-month'>
                        {currentDate.format("MMMM, YYYY")}
                    </div>
                    <div className='new-btn-wrapper'>
                        <div
                            className='new-btn'
                            onClick={() => handleOpenNewModal()}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Tạo
                        </div>
                    </div>
                </div>
                <Calendar
                    date={currentDate}
                    handleOpenNewModal={handleOpenNewModal}
                    tasks={tasks}
                    handleOpenTask={handleOpenTask}
                />
            </div>
            {/* Modal tạo mới */}
            <div className={`modal-wrapper ${isShowNewModal ? "active" : ""}`}>
                <div className='overlay' onClick={handleCloseNewModal}></div>
                <div className='modal'>
                    <div className='header'>
                        <div
                            className='close-toggle'
                            onClick={() => setIsShowNewModal(false)}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </div>
                    </div>
                    <div className='content'>
                        {/* Tên công việc */}
                        <div className='row-input no-icon'>
                            <input
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className='title-input'
                                type='text'
                                placeholder='Nhập tên công việc'
                            />
                        </div>
                        {/* Chọn ngày */}
                        <div className='row-input'>
                            <div className='icon'>
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "20px",
                                        width: "100%",
                                    }}
                                >
                                    <DatePicker
                                        value={currentDate}
                                        onChange={(e) => setCurrentDate(e)}
                                        format='DD/MM/YYYY' // Định dạng ngày thành dd/MM/yyyy
                                        sx={{
                                            flex: "7",
                                            "& .MuiInputBase-root": {
                                                border: "none", // Loại bỏ viền
                                                backgroundColor: "#e7e8eb ", // Màu nền input
                                                borderRadius: "8px", // Bo góc input
                                                transition:
                                                    "background-color 0.2s ease",
                                            },
                                            "& .MuiOutlinedInput-root:hover": {
                                                backgroundColor: "#d1d3d6", // Màu nền input
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                {
                                                    backgroundColor: "#d1d3d6", // Màu nền input
                                                },
                                            "& .MuiOutlinedInput-notchedOutline":
                                                {
                                                    border: "none", // Xóa viền outline mặc định
                                                },
                                            "& .MuiInputBase-input": {
                                                padding: "8px 16px", // Xóa padding của input
                                                fontSize: "16px",
                                            },
                                        }}
                                    />
                                    <TimePicker
                                        value={currentDate}
                                        onChange={(e) => setCurrentDate(e)}
                                        ampm={false} // Sử dụng định dạng 24h (bỏ đi nếu muốn 12h AM/PM)
                                        sx={{
                                            flex: "3",
                                            "& .MuiInputBase-root": {
                                                border: "none", // Loại bỏ viền
                                                backgroundColor: "#e7e8eb", // Màu nền input (có thể chỉnh sửa)
                                                borderRadius: "8px", // Bo góc input
                                                flex: 1,
                                                transition:
                                                    "background-color 0.2s ease",
                                            },
                                            "& .MuiOutlinedInput-root:hover": {
                                                backgroundColor: "#d1d3d6", // Màu nền input
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                {
                                                    backgroundColor: "#d1d3d6", // Màu nền input
                                                },
                                            "& .MuiOutlinedInput-notchedOutline":
                                                {
                                                    border: "none", // Xóa viền outline mặc định
                                                },
                                            "& .MuiInputBase-input": {
                                                padding: "8px 16px", // Xóa padding của input
                                                fontSize: "16px",
                                            },
                                        }}
                                    />
                                </div>
                            </LocalizationProvider>
                        </div>
                        {/* Lặp lại công việc */}
                        <div className='row-input no-icon'>
                            <Select
                                value={loopOption}
                                onChange={(e) => setLoopOption(e.target.value)}
                                displayEmpty
                                sx={{
                                    width: 200,
                                    "& .MuiInputBase-input": {
                                        padding: "8px 16px",
                                        backgroundColor: "#e7e8eb",
                                        border: "none",
                                        transition: "all 0.2s ease",
                                    },
                                    "& .MuiInputBase-input:hover": {
                                        backgroundColor: "#d1d3d6",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none", // Xóa viền outline mặc định
                                    },
                                }}
                            >
                                {/* Default */}
                                <MenuItem value={0}>Không lặp lại</MenuItem>
                                <MenuItem value={1}>Hằng ngày</MenuItem>
                                <MenuItem value={2}>Hằng tuần</MenuItem>
                                <MenuItem value={3}>Hằng tháng</MenuItem>
                                <MenuItem value={4}>Hằng năm</MenuItem>
                                <MenuItem value={5}>Cả tuần</MenuItem>
                            </Select>
                        </div>
                        {/* Mô tả công việc */}
                        <div className='row-input'>
                            <div className='icon'>
                                <FontAwesomeIcon icon={faEdit} />
                            </div>
                            <textarea
                                rows={8}
                                value={taskDescription}
                                onChange={(e) =>
                                    setTaskDescription(e.target.value)
                                }
                                placeholder='Thêm mô tả cho công việc'
                            />
                        </div>
                        {/* Nút xác nhận tạo công việc */}
                        <div className='row-input'>
                            <div className='new-btn-wrapper'>
                                <div
                                    className='new-btn'
                                    onClick={() => createNewTask()}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    Tạo
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal chỉnh sửa */}
            <div className={`modal-wrapper ${isShowEditModal ? "active" : ""}`}>
                <div className='overlay' onClick={handleCloseEditModal}></div>
                <div className='modal'>
                    <div className='header'>
                        <div
                            className='close-toggle'
                            onClick={() => setIsShowEditModal(false)}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </div>
                    </div>
                    <div className='content'>
                        {/* Tên công việc */}
                        <div className='row-input no-icon'>
                            <input
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className='title-input'
                                type='text'
                                placeholder='Nhập tên công việc'
                            />
                        </div>
                        {/* Chọn ngày */}
                        <div className='row-input'>
                            <div className='icon'>
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "20px",
                                        width: "100%",
                                    }}
                                >
                                    <DatePicker
                                        value={currentDate}
                                        onChange={(e) => setCurrentDate(e)}
                                        format='DD/MM/YYYY' // Định dạng ngày thành dd/MM/yyyy
                                        sx={{
                                            flex: "7",
                                            "& .MuiInputBase-root": {
                                                border: "none", // Loại bỏ viền
                                                backgroundColor: "#e7e8eb ", // Màu nền input
                                                borderRadius: "8px", // Bo góc input
                                                transition:
                                                    "background-color 0.2s ease",
                                            },
                                            "& .MuiOutlinedInput-root:hover": {
                                                backgroundColor: "#d1d3d6", // Màu nền input
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                {
                                                    backgroundColor: "#d1d3d6", // Màu nền input
                                                },
                                            "& .MuiOutlinedInput-notchedOutline":
                                                {
                                                    border: "none", // Xóa viền outline mặc định
                                                },
                                            "& .MuiInputBase-input": {
                                                padding: "8px 16px", // Xóa padding của input
                                                fontSize: "16px",
                                            },
                                        }}
                                    />
                                    <TimePicker
                                        value={currentDate}
                                        onChange={(e) => setCurrentDate(e)}
                                        ampm={false} // Sử dụng định dạng 24h (bỏ đi nếu muốn 12h AM/PM)
                                        sx={{
                                            flex: "3",
                                            "& .MuiInputBase-root": {
                                                border: "none", // Loại bỏ viền
                                                backgroundColor: "#e7e8eb", // Màu nền input (có thể chỉnh sửa)
                                                borderRadius: "8px", // Bo góc input
                                                flex: 1,
                                                transition:
                                                    "background-color 0.2s ease",
                                            },
                                            "& .MuiOutlinedInput-root:hover": {
                                                backgroundColor: "#d1d3d6", // Màu nền input
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                {
                                                    backgroundColor: "#d1d3d6", // Màu nền input
                                                },
                                            "& .MuiOutlinedInput-notchedOutline":
                                                {
                                                    border: "none", // Xóa viền outline mặc định
                                                },
                                            "& .MuiInputBase-input": {
                                                padding: "8px 16px", // Xóa padding của input
                                                fontSize: "16px",
                                            },
                                        }}
                                    />
                                </div>
                            </LocalizationProvider>
                        </div>
                        {/* Lặp lại công việc */}
                        <div className='row-input no-icon'>
                            <Select
                                value={loopOption}
                                onChange={(e) => setLoopOption(e.target.value)}
                                displayEmpty
                                sx={{
                                    width: 200,
                                    "& .MuiInputBase-input": {
                                        padding: "8px 16px",
                                        backgroundColor: "#e7e8eb",
                                        border: "none",
                                        transition: "all 0.2s ease",
                                    },
                                    "& .MuiInputBase-input:hover": {
                                        backgroundColor: "#d1d3d6",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none", // Xóa viền outline mặc định
                                    },
                                }}
                            >
                                {/* Default */}
                                <MenuItem value={0}>Không lặp lại</MenuItem>
                                <MenuItem value={1}>Hằng ngày</MenuItem>
                                <MenuItem value={2}>Hằng tuần</MenuItem>
                                <MenuItem value={3}>Hằng tháng</MenuItem>
                                <MenuItem value={4}>Hằng năm</MenuItem>
                                <MenuItem value={5}>Cả tuần</MenuItem>
                            </Select>
                        </div>
                        {/* Mô tả công việc */}
                        <div className='row-input'>
                            <div className='icon'>
                                <FontAwesomeIcon icon={faEdit} />
                            </div>
                            <textarea
                                rows={8}
                                value={taskDescription}
                                onChange={(e) =>
                                    setTaskDescription(e.target.value)
                                }
                                placeholder='Thêm mô tả cho công việc'
                            />
                        </div>
                        {/* Nút xóa và chỉnh sửa */}
                        <div className='row-input'>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "end",
                                    gap: "10px",
                                    flex: 1,
                                }}
                            >
                                <div
                                    className='delete-btn'
                                    onClick={() => deleteTask(taskId)}
                                >
                                    Xóa
                                </div>
                                <div
                                    className='edit-btn'
                                    onClick={() => editTask(taskId)}
                                >
                                    Chỉnh sửa
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OldCalendarPage;
