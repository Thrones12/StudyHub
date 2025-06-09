import React, { useState, useEffect } from "react";
import styles from "./TaskPage.module.scss";
import useFetch from "../../../hooks/useFetch";
import { MainLayoutTools, MainLayoutHeader } from "../../../components";
import { Tabs, Tab, Box, Checkbox, LinearProgress, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const task = [
    {
        name: "Làm bài tập Toán",
        completed: false,
        startDate: "20/05/2025",
        dueDate: "25/05/2025",
        progress: 60,
        priority: "Cao",
    },
    {
        name: "Đọc sách Văn học",
        completed: true,
        startDate: "18/05/2025",
        dueDate: "22/05/2025",
        progress: 100,
        priority: "Thấp",
    },
    {
        name: "Tập thể dục",
        completed: false,
        startDate: "21/05/2025",
        dueDate: "30/05/2025",
        progress: 30,
        priority: "Trung bình",
    },
];
const tabs = [
    {
        label: "Danh sách",
        icon: <FormatListBulletedIcon fontSize='small' />,
        content: <ListTab tasks={task} />,
    },
    {
        label: "Bảng",
        icon: <TableChartOutlinedIcon fontSize='small' />,
        content: <GroupTab />,
    },
    {
        label: "Lịch",
        icon: <CalendarTodayOutlinedIcon fontSize='small' />,
        content: <CalendarTab />,
    },
];

const TaskPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(null);
    const [direction, setDirection] = useState(0);

    const handleChange = (event, newValue) => {
        if (newValue === currentIndex) return;
        setPrevIndex(currentIndex);
        setDirection(newValue > currentIndex ? 1 : -1);
        setCurrentIndex(newValue);
    };

    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <MainLayoutHeader />
            {/* Content */}
            <div className={styles.container}>
                <Box>
                    {/* Tabs */}
                    <Tabs
                        value={currentIndex}
                        onChange={handleChange}
                        aria-label='icon label tabs example'
                        textColor='inherit'
                        sx={{
                            minHeight: "50px",
                            borderBottom: "1px solid #f1f1f1",
                        }}
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: "#1fb415",
                            },
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab
                                icon={tab.icon}
                                iconPosition='start'
                                label={tab.label}
                                sx={{
                                    paddingTop: "15px",
                                    minHeight: "50px",
                                    fontSize: "12px",
                                    boxShadow: "none",
                                    "&.Mui-selected": {
                                        color: "#1fb415",
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
                {/* Nội dung tab có hiệu ứng trượt cùng chiều */}
                <Box
                    sx={{
                        position: "relative",
                        height: "100%",
                        overflow: "auto",
                    }}
                >
                    {prevIndex !== null && (
                        <motion.div
                            key={`prev-${prevIndex}`}
                            initial={{ x: 0 }}
                            animate={{
                                x: direction === 1 ? -300 : 300,
                                opacity: 0,
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                top: 0,
                                left: 0,
                            }}
                            onAnimationComplete={() => setPrevIndex(null)}
                        >
                            {tabs[prevIndex].content}
                        </motion.div>
                    )}

                    <motion.div
                        key={`current-${currentIndex}`}
                        initial={{
                            x: direction === 1 ? 300 : -300,
                        }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                        }}
                    >
                        {tabs[currentIndex].content}
                    </motion.div>
                </Box>
            </div>
        </div>
    );
};
function ListTab(props) {
    const { tasks } = props;
    return (
        <div className={styles.Content}>
            <AccordionItem title='Chưa bắt đầu' tasks={tasks} />
            <AccordionItem title='Đang thực hiện' tasks={tasks} />
            <AccordionItem title='Hoàn thành' tasks={tasks} />
            <AccordionItem title='Quá hạn' tasks={tasks} />
        </div>
    );
}
function GroupTab(props) {
    return <div>{"Nội dung của Tab 2: Danh sách khóa học"}</div>;
}
function CalendarTab(props) {
    return <div>{"Nội dung của Tab 3: Thống kê kết quả học tập"}</div>;
}
const AccordionItem = ({ title, tasks }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className={styles.Accordion}>
            <div
                className={styles.AccordionSummary}
                onClick={() => setOpen((prev) => !prev)}
            >
                <ExpandMoreIcon className={open ? styles.rotate : ""} />
                <p>{title}</p>
            </div>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        className={styles.AccordionDetails}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <table>
                            <tr>
                                <th style={{ width: "30px" }}>
                                    <input type='checkbox' />
                                </th>
                                <th># ID</th>
                                <th>Tên công việc</th>
                                <th>Trạng thái</th>
                                <th>Bắt đầu</th>
                                <th>Hạn chót</th>
                                <th>Lặp lại</th>
                                <th>Tiến độ</th>
                                <th>Ưu tiên</th>
                            </tr>
                            {tasks.map((task) => (
                                <tr>
                                    <td>
                                        <input type='checkbox' />
                                    </td>
                                    <td>Task-135</td>
                                    <td>{task.name}</td>
                                    <td>
                                        {task.completed
                                            ? "Hoàn thành"
                                            : "Đang làm"}
                                    </td>
                                    <td>{task.startDate}</td>
                                    <td>{task.dueDate}</td>
                                    <td></td>
                                    <td>
                                        <Box display='flex' alignItems='center'>
                                            <LinearProgress
                                                variant='determinate'
                                                value={task.progress}
                                                sx={{ width: "100%", mr: 1 }}
                                            />
                                            <p>{task.progress}%</p>
                                        </Box>
                                    </td>
                                    <td>
                                        <Chip
                                            label={task.priority}
                                            color={
                                                task.priority === "Cao"
                                                    ? "error"
                                                    : task.priority ===
                                                      "Trung bình"
                                                    ? "warning"
                                                    : "success"
                                            }
                                            size='small'
                                        />
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colspan='9'>+ Công việc mới</td>
                            </tr>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default TaskPage;
