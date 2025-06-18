import React, { useState, useContext, useEffect, use } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./ProgressPage.css";
import constants from "../../../utils/constants";
import { LearningHourChart, SelectComponent } from "../../../components";
import dayjs from "dayjs";
import { User, TimeFormat } from "../../../services";
import { Link, useNavigate } from "react-router-dom";
import Noti from "../../../utils/Noti";
import useFetch from "../../../hooks/useFetch";
import styles from "./ProgressPage.module.scss";

let progressOptions = [
    { value: 0, label: "Tất cả" },
    { value: 1, label: "Đã hoàn thành" },
    { value: 2, label: "Chưa hoàn thành" },
];

const LearningStatisPage = () => {
    const nav = useNavigate();
    const { user } = useContext(AuthContext);
    // State variables
    // Dữ liệu đã sắp xếp để hiển thị trong bảng thời gian học tập
    const [sortedData, setSortedData] = useState([]);
    // Dữ liệu hiện tại là dữ liệu của tháng hiện tại
    const [currentData, setCurrentData] = useState();
    // Dữ liệu trước đó là dữ liệu của tháng trước
    const [prevData, setPrevData] = useState();
    // Dữ liệu biểu đồ hình tròn
    // Dữ liệu này sẽ được sử dụng để hiển thị biểu đồ thời gian học
    const [pieChartData, setPieChartData] = useState();

    // Lấy dữ liệu môn học
    const { data: courses } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    // CourseId là id của môn học hiện tại đang được chọn
    // Mặc định sẽ là môn học đầu tiên trong danh sách môn học
    const [courseId, setCourseId] = useState();
    const [courseOptions, setCourseOptions] = useState([]);
    useEffect(() => {
        if (courses && courses.length > 0) {
            setCourseId(courses[0]._id);
            setCourseOptions(
                courses.map((c) => ({
                    value: c._id,
                    label: c.title,
                }))
            );
        }
    }, [courses]);
    // State month là tháng hiện tại đang được chọn
    const [month, setMonth] = useState(0);
    // State year là năm hiện tại đang được chọn
    const [year, setYear] = useState(0);
    // State monthOptions là danh sách các tháng có dữ liệu học tập
    const [monthOptions, setMonthOptions] = useState([]);
    // State yearOptions là danh sách các năm có dữ liệu học tập
    const [yearOptions, setYearOptions] = useState([]);
    // Dữ liệu này sẽ được sử dụng để hiển thị biểu đồ thời gian học
    useEffect(() => {
        if (!user?.learningHour) return;

        const monthsSet = new Set();
        const yearsSet = new Set();

        user.learningHour.forEach((entry) => {
            const date = dayjs(entry.time);
            const month = date.month(); // 0-11
            const year = date.year();

            monthsSet.add(month);
            yearsSet.add(year);
        });

        // Tạo danh sách tháng từ Set
        const monthLabels = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
        ];

        const monthList = Array.from(monthsSet)
            .sort((a, b) => a - b)
            .map((m) => ({ value: m, label: monthLabels[m] }));

        const yearList = Array.from(yearsSet)
            .sort((a, b) => b - a)
            .map((y) => ({ value: y, label: y.toString() }));

        setMonthOptions(monthList);
        setYearOptions(yearList);
        setMonth(
            monthList.length > 0 ? monthList[monthList.length - 1].value : 0
        );
        setYear(
            yearList.length > 0 ? yearList[0].value : new Date().getFullYear()
        );
    }, [user]);

    // State progressData là dữ liệu tiến độ học tập của người dùng
    // Dữ liệu này sẽ được sử dụng để hiển thị tiến độ học tập của người dùng
    const [progressData, setProgressData] = useState();
    // State FilterdProgressData là dữ liệu tiến độ học tập đã được lọc theo tiến độ
    // Dữ liệu này sẽ được sử dụng để hiển thị tiến độ học tập của người dùng
    const [FilterdProgressData, setFilterdProgressData] = useState();
    // progressFilter là giá trị của bộ lọc tiến độ học tập
    // 0: Tất cả, 1: Đã hoàn thành, 2: Chưa hoàn thành
    // Mặc định là 0 (Tất cả)
    const [progressFilter, setProgressFilter] = useState(0);

    // Lấy dữ liệu thời gian học tập của người dùng theo môn học, tháng và năm
    // Khi người dùng thay đổi môn học, tháng hoặc năm thì sẽ gọi lại hàm
    useEffect(() => {
        const fetchData = async () => {
            if (
                !courses ||
                courses.length === 0 ||
                !user ||
                !courseId ||
                month === null ||
                year === null
            )
                return;

            try {
                const [current, previous] = await Promise.all([
                    User.GetLearningHour(user._id, courseId, month, year),
                    User.GetLearningHour(user._id, courseId, month - 1, year),
                ]);

                setCurrentData(current);
                setPrevData(previous);

                // Xử lý pieChartData
                if (current && previous) {
                    const newData = current.map((d) => {
                        const prev = previous.find(
                            (p) => p.subjectTitle === d.subjectTitle
                        );
                        return {
                            name: d.subjectTitle,
                            current: d.second
                                ? (d.second / 3600).toFixed(1)
                                : 0,
                            previous: prev?.second
                                ? (prev.second / 3600).toFixed(1)
                                : 0,
                        };
                    });

                    setPieChartData(newData);

                    // Sắp xếp
                    const sorted = [...current].sort(
                        (a, b) => b.second - a.second
                    );
                    setSortedData(sorted);
                }
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu học:", err);
            }
        };

        fetchData();
    }, [user, courses, courseId, month, year]);

    // Lấy dữ liệu tiến độ học tập của người dùng
    // Khi người dùng thay đổi môn học, tháng hoặc năm thì sẽ gọi lại hàm
    useEffect(() => {
        if (user) User.GetProgressData(user._id, setProgressData);
    }, [user]);

    // Khi có dữ liệu tiến độ học tập của người dùng
    // Thì sẽ lọc dữ liệu này theo tiến độ học tập
    useEffect(() => {
        if (progressData && progressData.length > 0) {
            // Nếu progressFilter là 1 thì lọc dữ liệu tiến độ học tập đã hoàn thành
            if (progressFilter === 1) {
                setFilterdProgressData(
                    progressData.filter((d) => d.progress === "100")
                );
            }
            // Nếu progressFilter là 2 thì lọc dữ liệu tiến độ học tập chưa hoàn thành
            else if (progressFilter === 2)
                setFilterdProgressData(
                    progressData.filter((d) => d.progress !== "100")
                );
            // Nếu progressFilter là 0 thì hiển thị tất cả dữ liệu tiến độ học tập
            else setFilterdProgressData([...progressData]);
        }
    }, [progressData, progressFilter]);

    // Hàm xử lý điều hướng đến trang bài giảng
    // Nếu link là rỗng thì sẽ hiển thị thông báo
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
                                <SelectComponent
                                    value={year}
                                    setValue={setYear}
                                    options={yearOptions}
                                />
                            </div>
                        </div>
                        {/* End: card-header */}

                        {/* Begin: card-body */}
                        <div className={styles.Body} style={{ padding: 10 }}>
                            {!month || !year || !pieChartData ? (
                                <div className={styles.empty}>
                                    <img src='/images/oops.png' alt='image' />
                                    <h3>Bạn chưa học tập bao giờ!</h3>
                                    <button
                                        type='button'
                                        onClick={() => nav("/course")}
                                    >
                                        Học thôi nào
                                    </button>
                                </div>
                            ) : (
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
                                {sortedData.length <= 0 && (
                                    <div className={styles.empty}>
                                        <img
                                            src='/images/oops.png'
                                            alt='image'
                                        />
                                        <h3>Bạn chưa học tập bao giờ!</h3>
                                    </div>
                                )}
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
                            FilterdProgressData.length > 0 ? (
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
                                })
                            ) : (
                                <div className={styles.empty}>
                                    <img src='/images/oops.png' alt='image' />
                                    <h3>Chưa có dữ liệu tiến độ học tập!</h3>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* End: card-body */}
                </div>
            </div>
        </div>
    );
};

export default LearningStatisPage;
