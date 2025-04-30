import React, { useEffect, useState } from "react";
import "./CalendarPage.css";
import Calendar from "../../components/Calendar/Calendar";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { TimeFormat } from "../../services";
import { motion, AnimatePresence } from "framer-motion";
import ModalTask from "../../components/ModalTask/ModalTask";
import { useNavigate, useParams } from "react-router-dom";

// animation variants
const variants = {
    initial: (direction) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
        position: "relative",
    }),
    animate: {
        x: 0,
        opacity: 1,
        position: "relative",
        transition: { duration: 0.2 },
    },
    exit: (direction) => ({
        x: direction > 0 ? -50 : 50,
        opacity: 0,
        position: "relative",
        transition: { duration: 0.2 },
    }),
};

const CalendarPage = () => {
    const nav = useNavigate();
    const { year, month } = useParams();
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [direction, setDirection] = useState(0); // 1: next, -1: prev
    const [isOpenModalTask, setIsOpenModalTask] = useState(false);
    const [reload, setReload] = useState(false);
    useEffect(() => {
        if (year && month) {
            setCurrentDate(dayjs(`${year}-${month}-${1}`));
        }
    }, [year, month, reload]);

    const currentMonth = () => {
        setDirection(0);
        setCurrentDate(dayjs());
    };

    const nextMonth = () => {
        setDirection(1);
        let date = currentDate.add(1, "month");
        setCurrentDate(date);
        nav(`/calendar/${date.year()}/${date.month() + 1}`);
    };

    const prevMonth = () => {
        setDirection(-1);
        let date = currentDate.subtract(1, "month");
        setCurrentDate(date);
        nav(`/calendar/${date.year()}/${date.month() + 1}`);
    };
    return (
        <div>
            <div className='calendar-page'>
                <div className='controls'>
                    <div className='btn' onClick={currentMonth}>
                        Hôm nay
                    </div>
                    <div className='icon' onClick={prevMonth}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </div>
                    <div className='date'>
                        {TimeFormat.getMonthYear(currentDate)}
                    </div>
                    <div className='icon' onClick={nextMonth}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            justifyContent: "flex-end",
                        }}
                    >
                        <div
                            className='btn'
                            onClick={() => setIsOpenModalTask(true)}
                        >
                            Tạo mới
                        </div>
                    </div>
                </div>

                <AnimatePresence mode='wait' custom={direction}>
                    <motion.div
                        onWheel={(e) => {
                            if (e.deltaY > 0) {
                                nextMonth();
                            } else if (e.deltaY < 0) {
                                prevMonth();
                            }
                        }}
                        key={currentDate.toString()}
                        custom={direction}
                        variants={variants}
                        initial='initial'
                        animate='animate'
                        exit='exit'
                    >
                        <Calendar date={currentDate} setReload={setReload} />
                    </motion.div>
                </AnimatePresence>

                <ModalTask
                    isOpen={isOpenModalTask}
                    setIsOpen={setIsOpenModalTask}
                    setReload={setReload}
                />
            </div>
        </div>
    );
};

export default CalendarPage;
