import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./ProgressPage.css";
import constants from "../../../utils/constants";
import { LearningHourChart, SelectComponent } from "../../../components";
import dayjs from "dayjs";
import { User, Course, TimeFormat } from "../../../services";
import { Link, useNavigate } from "react-router-dom";
import Noti from "../../../utils/Noti";

const monthOptions = [
    { value: 0, text: "Tháng 1" },
    { value: 1, text: "Tháng 2" },
    { value: 2, text: "Tháng 3" },
    { value: 3, text: "Tháng 4" },
    { value: 4, text: "Tháng 5" },
    { value: 5, text: "Tháng 6" },
    { value: 6, text: "Tháng 7" },
    { value: 7, text: "Tháng 8" },
    { value: 8, text: "Tháng 9" },
    { value: 9, text: "Tháng 10" },
    { value: 10, text: "Tháng 11" },
    { value: 11, text: "Tháng 12" },
];
let yearOptions = [];
let courseOptions = [];
let progressOptions = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Đã hoàn thành" },
    { value: 2, text: "Chưa hoàn thành" },
];

const LearningStatisPage = () => {
    const nav = useNavigate();
    const { userId } = useContext(AuthContext);
    // For table
    const [sortedData, setSortedData] = useState([]);
    // For chart
    const [currentData, setCurrentData] = useState();
    const [prevData, setPrevData] = useState();
    const [pieChartData, setPieChartData] = useState();
    // For select
    const [courses, setCourses] = useState([]);
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
            years.push({ value: y, text: y.toString() });
        }
        yearOptions = years;
        Course.GetAll(setCourses);
    }, [userId]);

    useEffect(() => {
        if (courses && courses.length > 0) {
            setCourseId(courses[0]._id);
        }
    }, [courses]);

    useEffect(() => {
        if (courses.length > 0 && userId && courseId && month && year) {
            courseOptions = courses.map((c) => ({
                value: c._id,
                text: c.title,
            }));
            User.GetLearningHour(userId, courseId, month, year, setCurrentData);
            User.GetLearningHour(
                userId,
                courseId,
                month - 1,
                year,
                setPrevData
            );
        }
    }, [userId, courses, courseId, month, year]);

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
        if (userId) User.GetProgressData(userId, setProgressData);
    }, [userId]);

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
            <div className='profile-page' style={{ marginBottom: 100 }}>
                <div className='row' style={{ margin: 0, gap: 30 }}>
                    <div className='card' style={{ flex: 3 }}>
                        {/* Begin: card-header */}
                        <div className='card-header'>
                            <div>Biểu đồ</div>
                            <div>
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
                        <div className='card-body' style={{ padding: 10 }}>
                            {pieChartData && (
                                <LearningHourChart data={pieChartData} />
                            )}
                        </div>
                        {/* End: card-body */}
                    </div>
                    <div className='card' style={{ flex: 2 }}>
                        {/* Begin: card-header */}
                        <div className='card-header'>
                            <div>Thời gian học tập</div>
                        </div>
                        {/* End: card-header */}

                        {/* Begin: card-body */}
                        <div className='card-body' style={{ padding: 0 }}>
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

                <div className='card'>
                    {/* Begin: card-header */}
                    <div className='card-header'>
                        <div>Tiến độ học tập</div>
                        <SelectComponent
                            value={progressFilter}
                            setValue={setProgressFilter}
                            options={progressOptions}
                        />
                    </div>
                    {/* End: card-header */}

                    {/* Begin: card-body */}
                    <div className='card-body'>
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
                                                    <span
                                                        style={{
                                                            marginLeft: 10,
                                                            marginRight: 10,
                                                        }}
                                                    >
                                                        -
                                                    </span>
                                                    {item.doneExams}/
                                                    {item.totalExams} Bài kiểm
                                                    tra
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
