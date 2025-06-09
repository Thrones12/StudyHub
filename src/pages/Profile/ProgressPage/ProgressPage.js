import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./ProgressPage.css";
import constants from "../../../utils/constants";
import { LearningHourChart, SelectComponent } from "../../../components";
import dayjs from "dayjs";
import { User, TimeFormat } from "../../../services";
import { useNavigate } from "react-router-dom";
import Noti from "../../../utils/Noti";
import useFetch from "../../../hooks/useFetch";
import styles from "./ProgressPage.module.scss";

const monthOptions = [
    { value: 0, label: "Tháng 1" },
    { value: 1, label: "Tháng 2" },
    { value: 2, label: "Tháng 3" },
    { value: 3, label: "Tháng 4" },
    { value: 4, label: "Tháng 5" },
    { value: 5, label: "Tháng 6" },
    { value: 6, label: "Tháng 7" },
    { value: 7, label: "Tháng 8" },
    { value: 8, label: "Tháng 9" },
    { value: 9, label: "Tháng 10" },
    { value: 10, label: "Tháng 11" },
    { value: 11, label: "Tháng 12" },
];
let yearOptions = [];
let courseOptions = [];
let progressOptions = [
    { value: 0, label: "Tất cả" },
    { value: 1, label: "Đã hoàn thành" },
    { value: 2, label: "Chưa hoàn thành" },
];

const LearningStatisPage = () => {
    const nav = useNavigate();
    const { user } = useContext(AuthContext);
    // For table
    const [sortedData, setSortedData] = useState([]);
    // For chart
    const [currentData, setCurrentData] = useState();
    const [prevData, setPrevData] = useState();
    const [pieChartData, setPieChartData] = useState();
    // For select

    // Lấy dữ liệu môn học
    const { data: courses } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    const [courseId, setCourseId] = useState();
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);
    // For progress
    const [progressData, setProgressData] = useState();
    const [FilterdProgressData, setFilterdProgressData] = useState();
    const [progressFilter, setProgressFilter] = useState(0);

    // Xử lí dữ liệu tháng, năm, và giờ học
    useEffect(() => {
        let date = dayjs();
        setMonth(date.month());
        setYear(date.year());
        let years = [];
        for (let y = date.year(); y >= date.year() - 30; y--) {
            years.push({ value: y, label: y.toString() });
        }
        yearOptions = years;
    }, [user]);

    useEffect(() => {
        if (courses && courses.length > 0) {
            setCourseId(courses[0]._id);
        }
    }, [courses]);

    useEffect(() => {
        if (
            courses &&
            courses.length > 0 &&
            user &&
            courseId &&
            month &&
            year
        ) {
            courseOptions = courses.map((c) => ({
                value: c._id,
                label: c.title,
            }));

            User.GetLearningHour(
                user._id,
                courseId,
                month,
                year,
                setCurrentData
            );
            User.GetLearningHour(
                user._id,
                courseId,
                month - 1,
                year,
                setPrevData
            );
        }
    }, [user, courses, courseId, month, year]);

    useEffect(() => {
        if (currentData && currentData.length > 0) {
            let newData = currentData.map((d) => ({
                name: d.subjectTitle,
                current: (d.second / 3600).toFixed(1),
                previous: prevData
                    ? (
                          prevData.find(
                              (p) => p.subjectTitle === d.subjectTitle
                          ).second / 3600
                      ).toFixed(1)
                    : 0,
            }));

            setPieChartData(newData);

            setSortedData(currentData.sort((a, b) => b.second - a.second));
        }
    }, [currentData, prevData]);

    useEffect(() => {
        if (user) User.GetProgressData(user._id, setProgressData);
    }, [user]);

    useEffect(() => {
        if (progressData && progressData.length > 0) {
            if (progressFilter === 1) {
                setFilterdProgressData(
                    progressData.filter((d) => d.progress === "100")
                );
            } else if (progressFilter === 2)
                setFilterdProgressData(
                    progressData.filter((d) => d.progress !== "100")
                );
            else setFilterdProgressData([...progressData]);
        }
    }, [progressData, progressFilter]);

    const handleNavigate = (link) => {
        if (link.trim()) {
            nav(link);
        } else {
            Noti.info("Môn học bạn chọn hiện chưa có bài giảng");
        }
    };
    return (
        <div className='container'>
            <div className='profile-page' style={{ marginBottom: 30 }}>
                <div className='row' style={{ margin: "-30px 0", gap: 30 }}>
                    <div className={styles.Card} style={{ flex: 3 }}>
                        {/* Begin: card-header */}
                        <div className={styles.Header}>
                            <div>Biểu đồ</div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 5,
                                }}
                            >
                                {courseId && courseOptions.length > 0 && (
                                    <SelectComponent
                                        value={courseId}
                                        setValue={setCourseId}
                                        options={courseOptions}
                                    />
                                )}
                                <SelectComponent
                                    value={month}
                                    setValue={setMonth}
                                    options={monthOptions}
                                />
                                {yearOptions.length > 0 && (
                                    <SelectComponent
                                        value={year}
                                        setValue={setYear}
                                        options={yearOptions}
                                    />
                                )}
                            </div>
                        </div>
                        {/* End: card-header */}

                        {/* Begin: card-body */}
                        <div className={styles.Body} style={{ padding: 10 }}>
                            {pieChartData && (
                                <LearningHourChart data={pieChartData} />
                            )}
                        </div>
                        {/* End: card-body */}
                    </div>
                    <div className={styles.Card} style={{ flex: 2 }}>
                        {/* Begin: card-header */}
                        <div className={styles.Header}>
                            <div>Thời gian học tập</div>
                        </div>
                        {/* End: card-header */}

                        {/* Begin: card-body */}
                        <div className={styles.Body} style={{ padding: 0 }}>
                            <div className='table-scroll-wrapper'>
                                <table className='learning-time-table'>
                                    <thead>
                                        <tr>
                                            <th>Top</th>
                                            <th>Môn học</th>
                                            <th>Thời gian học</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedData.map((subject, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{subject.subjectTitle}</td>
                                                <td>
                                                    {TimeFormat.convertToHourAndMinute(
                                                        subject.second
                                                    )}
                                                </td>
                                                <td>
                                                    <div
                                                        className='table-link'
                                                        onClick={() =>
                                                            handleNavigate(
                                                                subject.link
                                                            )
                                                        }
                                                    >
                                                        Đi đến
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* End: card-body */}
                    </div>
                </div>

                <div className={styles.Card}>
                    {/* Begin: card-header */}
                    <div className={styles.Header}>
                        <div>Tiến độ học tập</div>
                        <SelectComponent
                            value={progressFilter}
                            setValue={setProgressFilter}
                            options={progressOptions}
                        />
                    </div>
                    {/* End: card-header */}

                    {/* Begin: card-body */}
                    <div className={styles.Body}>
                        <div className='learning-progress'>
                            {FilterdProgressData &&
                                FilterdProgressData.map((item, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className='learning-progress-item'
                                            onClick={() => nav(item.link)}
                                        >
                                            <div
                                                className='progcess-bar'
                                                style={{
                                                    "--score": `${item.progress}%`,
                                                }}
                                            >
                                                <div className='text'>{`${item.progress}%`}</div>
                                            </div>
                                            <div className='info'>
                                                <div className='primary'>
                                                    {item.courseTitle}
                                                </div>
                                                <div className='secodary'>
                                                    {item.subjectTitle}
                                                </div>
                                                <div className='primary'>
                                                    {item.doneLessons}/
                                                    {item.totalLessons} Bài học
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    {/* End: card-body */}
                </div>
            </div>
        </div>
    );
};

export default LearningStatisPage;
