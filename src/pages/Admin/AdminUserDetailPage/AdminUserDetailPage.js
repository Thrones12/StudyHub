import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import styles from "./AdminUserDetailPage.module.scss";
import {
    AdminLayoutHeader,
    ChartAverageScore,
    ChartHistogram,
    LearningHourChart,
    SelectComponent,
} from "../../../components";
import dayjs from "dayjs";
import { ExamResult, TimeFormat, User } from "../../../services";
import Noti from "../../../utils/Noti";

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
let statisCourseOptions = [];
let statisSubjectOptions = [];
const AdminUserDetailPage = () => {
    const { userId } = useParams();
    // Lấy dữ liệu người dùng
    const { data: user } = useFetch({
        url: `http://localhost:8080/api/user/${userId}`,
        method: "GET",
        deps: [userId],
    });

    // TIẾN ĐỘ
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

    // THỐNG KÊ
    const [statisCourseId, setStatisCourseId] = useState();
    const [statisSubjectId, setStatisSubjectId] = useState();
    const [subjects, setSubjects] = useState([]);

    const [data, setData] = useState();
    const [examResults, setExamResults] = useState([]);

    useEffect(() => {
        if (user && statisSubjectId)
            ExamResult.GetHistogramData(
                user._id,
                statisSubjectId,
                setExamResults
            );
    }, [user, statisCourseId, statisSubjectId]);

    useEffect(() => {
        if (courses && courses.length > 0) {
            setStatisCourseId(courses[0]._id);
            statisCourseOptions = courses.map((c) => ({
                value: c._id,
                label: c.title,
            }));

            setSubjects(courses[0].subjects);
            setStatisSubjectId(courses[0].subjects[0]._id);
            statisSubjectOptions = courses[0].subjects.map((s) => ({
                value: s._id,
                label: s.title,
            }));
        }
    }, [courses]);

    useEffect(() => {
        if (courseId) {
            User.GetAverageScore(user._id, statisCourseId, setData);
            let course = courses.find((c) => c._id === statisCourseId);
            setSubjects(course.subjects);
            setStatisSubjectId(course.subjects[0]._id);
            statisSubjectOptions = course.subjects.map((s) => ({
                value: s._id,
                label: s.title,
            }));
        }
    }, [statisCourseId]);

    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <AdminLayoutHeader />

            <div className='row' style={{ margin: "0 30px 0", gap: 30 }}>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* End: card-body */}
                </div>
            </div>

            <div className='row' style={{ margin: "-30px 30px 0", gap: 30 }}>
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

            <div className='row' style={{ margin: "-30px 30px 0", gap: 30 }}>
                <div className={styles.Card}>
                    {/* Begin: card-header */}
                    <div className={styles.Header}>
                        <div>Kết quả học tập</div>
                        <div>
                            {statisCourseId &&
                                statisCourseOptions.length > 0 && (
                                    <SelectComponent
                                        value={statisCourseId}
                                        setValue={setStatisCourseId}
                                        options={statisCourseOptions}
                                    />
                                )}
                        </div>
                    </div>
                    {/* End: card-header */}

                    {/* Begin: card-body */}
                    <div className={styles.Body}>
                        {/* Begin: row name */}
                        {data && (
                            <div className='row'>
                                <div className='col-3'>
                                    <div className={styles.BodyText}>
                                        Điểm trung bình các môn học
                                    </div>
                                    <div className={styles.Score}>
                                        <p>{data.averageScore}</p>
                                    </div>
                                    <div className={styles.MoreInfo}>
                                        <div className={styles.Info}>
                                            Cao nhất:{" "}
                                            {data.highest
                                                ? data.highest
                                                : "Không có"}
                                        </div>
                                        <div className={styles.Info}>
                                            Thấp nhất:{" "}
                                            {data.lowest
                                                ? data.lowest
                                                : "Không có"}
                                        </div>
                                        <div className={styles.Info}>
                                            Số lượng bài kiểm tra:{" "}
                                            {data.examCount}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-9'>
                                    <ChartAverageScore data={data.subjects} />
                                </div>
                            </div>
                        )}
                        {/* End: row name */}
                    </div>
                    {/* End: card-body */}
                </div>
            </div>

            <div className='row' style={{ margin: "-30px 30px 0", gap: 30 }}>
                <div className={styles.Card} style={{ flex: 3 }}>
                    {/* Begin: card-header */}
                    <div className={styles.Header}>
                        <div>Phổ điểm môn học</div>
                        <div>
                            {statisCourseId &&
                                statisCourseOptions.length > 0 && (
                                    <SelectComponent
                                        value={statisCourseId}
                                        setValue={setStatisCourseId}
                                        options={statisCourseOptions}
                                    />
                                )}
                            {statisSubjectId &&
                                statisSubjectOptions.length > 0 && (
                                    <SelectComponent
                                        value={statisSubjectId}
                                        setValue={setStatisSubjectId}
                                        options={statisSubjectOptions}
                                    />
                                )}
                        </div>
                    </div>
                    {/* End: card-header */}
                    {/* Begin: card-body */}
                    {examResults && (
                        <div className={styles.Body} style={{ padding: 10 }}>
                            {/* Begin: row name */}
                            <ChartHistogram examResults={examResults} />
                            {/* End: row name */}
                        </div>
                    )}
                    {/* End: card-body */}
                </div>

                <div className={styles.Card} style={{ flex: 3 }}>
                    {/* Begin: card-header */}
                    <div className={styles.Header}>
                        <div>Bài kiểm tra</div>
                    </div>
                    {/* End: card-header */}

                    {/* Begin: card-body */}
                    <div className={styles.Body} style={{ padding: 0 }}>
                        <div className='table-scroll-wrapper'>
                            <table className='learning-time-table'>
                                <thead>
                                    <tr>
                                        <th>Bài kiểm tra</th>
                                        <th>Mức độ</th>
                                        <th>Điểm số</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examResults.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.exam.title}</td>
                                            <td>{item.exam.level}</td>
                                            <td>{item.score.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* End: card-body */}
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
