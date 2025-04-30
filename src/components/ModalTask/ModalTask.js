import React, { useContext, useEffect, useState } from "react";
import "./ModalTask.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClose,
    faCheckCircle as faCheckedCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faClock, faEdit } from "@fortawesome/free-regular-svg-icons";
import {
    LocalizationProvider,
    TimePicker,
    DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Select, MenuItem } from "@mui/material";
import dayjs from "dayjs";
import { Task } from "../../services";
import { AuthContext } from "../../context/AuthContext";

const ModalTask = ({
    initDate,
    isOpen,
    setIsOpen,
    setReload,
    task,
    setTask,
}) => {
    const { userId } = useContext(AuthContext);
    const [date, setDate] = useState(dayjs());
    const [taskTitle, setTaskTitle] = useState("");
    const [loopOption, setLoopOption] = useState(0);
    const [taskDescription, setTaskDescription] = useState("");

    // Set date khi có giá trị đầu vào là ngày
    useEffect(() => {
        setDate(dayjs(initDate));
    }, [initDate]);

    // Set task khi có giá trị đầu vào là công việc
    useEffect(() => {
        if (task) {
            setDate(dayjs(task.date));
            setTaskTitle(task.title);
            setTaskDescription(task.description);
            setLoopOption(task.loop);
        }
    }, [task]);

    // Reset modal khi đóng
    useEffect(() => {
        if (!isOpen) {
            setDate(dayjs());
            setTaskTitle("");
            setTaskDescription("");
            setLoopOption(0);
        }
    }, [isOpen]);

    // Tắt modal khi nhấn ESC
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setTask(null);
            }
        };
        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [setIsOpen]);

    // Khi chọn ngày
    const handleDateChange = (newDate) => {
        if (!newDate) return;
        const updated = dayjs(date)
            .set("date", newDate.date())
            .set("month", newDate.month())
            .set("year", newDate.year());
        setDate(updated);
    };

    // Khi chọn giờ
    const handleTimeChange = (newTime) => {
        if (!newTime) return;
        const updated = dayjs(date)
            .set("hour", newTime.hour())
            .set("minute", newTime.minute())
            .set("second", newTime.second());
        setDate(updated);
    };

    // Xác nhận tạo công việc
    const handleSubmit = () => {
        const data = {
            id: task?._id || "",
            title: taskTitle,
            loop: loopOption,
            description: taskDescription,
            date: date.toISOString(),
        };

        // Handle
        if (task) Task.Update({ ...data });
        else Task.Create({ ...data, userId });

        // Done
        setIsOpen(false);
        setReload((prev) => !prev);
        setTask(null);
    };
    const handleDelete = () => {
        Task.Delete(task._id);
        // Done
        setIsOpen(false);
        setReload((prev) => !prev);
        setTask(null);
    };
    return (
        <div className={`modal-new-task ${isOpen ? "show" : ""}`}>
            <div
                className='modal-overlay'
                onClick={() => setIsOpen(false)}
            ></div>
            <div className='modal' onWheel={(e) => e.stopPropagation()}>
                <div className='header'>
                    Công việc mới
                    <FontAwesomeIcon
                        icon={faClose}
                        onClick={() => setIsOpen(false)}
                    />
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
                                    value={date}
                                    onChange={handleDateChange}
                                    format='DD/MM/YYYY' // Định dạng ngày thành dd/MM/yyyy
                                    sx={{
                                        flex: "1",
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
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            border: "none", // Xóa viền outline mặc định
                                        },
                                        "& .MuiInputBase-input": {
                                            padding: "8px 16px", // Xóa padding của input
                                            fontSize: "16px",
                                        },
                                    }}
                                />
                                <TimePicker
                                    value={date}
                                    onChange={handleTimeChange}
                                    ampm={false} // Sử dụng định dạng 24h (bỏ đi nếu muốn 12h AM/PM)
                                    sx={{
                                        flex: "1",
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
                                        "& .MuiOutlinedInput-notchedOutline": {
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
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder='Thêm mô tả cho công việc'
                        />
                    </div>
                    {/* Nút xác nhận tạo công việc */}
                    {task ? (
                        <div className='row-input btn-wrapper'>
                            <div
                                className='btn btn-red'
                                onClick={() => handleDelete()}
                            >
                                Xóa
                            </div>
                            <div
                                className='btn btn-blue'
                                onClick={() => handleSubmit()}
                            >
                                Cập nhập
                            </div>
                        </div>
                    ) : (
                        <div className='row-input btn-wrapper'>
                            <div
                                className='btn btn-green'
                                onClick={() => handleSubmit()}
                            >
                                Xác nhận
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalTask;
