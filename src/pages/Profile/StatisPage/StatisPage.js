import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./StatisPage.css";
import ChartAverageScore from "../../../components/ChartAverageScore/ChartAverageScore";
import { User, ExamResult } from "../../../services";
import { ChartHistogram, SelectComponent } from "../../../components";
import { useNavigate } from "react-router-dom";
import styles from "./StatisPage.module.scss";
import useFetch from "../../../hooks/useFetch";
import { formatExamLevel } from "../../../utils/Helpers";

let subjectOptions = [];

const ExamStatisPage = () => {
    const nav = useNavigate();
    const { user } = useContext(AuthContext);
    // Lấy dữ liệu môn học
    const { data: courses } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    // CourseId là id của môn học hiện tại đang được chọn
    // Mặc định sẽ là môn học đầu tiên trong danh sách môn học
    const [courseId, setCourseId] = useState();
    // SubjectId là id của môn học trong chương trình học hiện tại đang được chọn
    const [subjectId, setSubjectId] = useState();
    // CourseOptions là danh sách các môn học để hiển thị trong dropdown
    const [courseOptions, setCourseOptions] = useState([]);
    // SubjectOptions là danh sách các môn học trong chương trình học hiện tại
    const [subjectOptions, setSubjectOptions] = useState([]);
    // Khi courses thay đổi, ta sẽ lấy môn học đầu tiên và set courseId, subjectId
    // và cập nhật danh sách môn học trong dropdown
    useEffect(() => {
        if (courses && courses.length > 0) {
            // Lấy chương trình học đầu tiên
            setCourseId(courses[0]._id);
            setCourseOptions(
                courses.map((c) => ({
                    value: c._id,
                    label: c.title,
                }))
            );
            // Lấy môn học đầu tiên trong chương trình học đó
            setSubjectId(courses[0].subjects[0]._id);
            setSubjectOptions(
                courses[0].subjects.map((s) => ({
                    value: s._id,
                    label: s.title,
                }))
            );
        }
    }, [courses]);
    // Khi courseId thay đổi, ta sẽ lấy điểm trung bình của người dùng trong môn học đó
    // và cập nhật danh sách môn học trong dropdown
    useEffect(() => {
        if (courseId) {
            // Lấy điểm trung bình của người dùng trong môn học hiện tại
            User.GetAverageScore(user._id, courseId, setData);
            // Cập nhật danh sách môn học trong dropdown
            let course = courses.find((c) => c._id === courseId);
            setSubjectId(course.subjects[0]._id);
            setSubjectOptions(
                course.subjects.map((s) => ({
                    value: s._id,
                    label: s.title,
                }))
            );
        }
    }, [courseId]);

    const [data, setData] = useState();
    const [examResults, setExamResults] = useState([]);

    // Lấy dữ liệu phổ điểm của người dùng trong môn học hiện tại
    useEffect(() => {
        if (user && subjectId)
            ExamResult.GetHistogramData(user._id, subjectId, setExamResults);
    }, [user, courseId, subjectId]);

    return (
        <div className='container'>
            <div className='profile-page' style={{ marginBottom: 30 }}>
                {/* Begin: statis card */}
                <div className={styles.Card}>
                    {/* Begin: card-header */}
                    <div className={styles.Header}>
                        <div>Kết quả học tập</div>
                        <div>
                            {courseId && courseOptions.length > 0 && (
                                <SelectComponent
                                    value={courseId}
                                    setValue={setCourseId}
                                    options={courseOptions}
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
                                    <div className='text'>Điểm tổng kết</div>
                                    <div className='score'>
                                        <p>{data.averageScore}</p>
                                    </div>
                                    <div className='more-info'>
                                        <div className='info'>
                                            Cao nhất:{" "}
                                            {data.highest
                                                ? data.highest
                                                : "Không có"}
                                        </div>
                                        <div className='info'>
                                            Thấp nhất:{" "}
                                            {data.lowest
                                                ? data.lowest
                                                : "Không có"}
                                        </div>
                                        <div className='info'>
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
                {/* End: statis card */}
                <div className='row' style={{ margin: "-30px 0", gap: 30 }}>
                    <div className={styles.Card} style={{ flex: 3 }}>
                        {/* Begin: card-header */}
                        <div className={styles.Header}>
                            <div>Phổ điểm môn học</div>
                            <div style={{ display: "flex", gap: 10 }}>
                                {courseId && courseOptions.length > 0 && (
                                    <SelectComponent
                                        value={courseId}
                                        setValue={setCourseId}
                                        options={courseOptions}
                                    />
                                )}
                                {subjectId && subjectOptions.length > 0 && (
                                    <SelectComponent
                                        value={subjectId}
                                        setValue={setSubjectId}
                                        options={subjectOptions}
                                    />
                                )}
                            </div>
                        </div>
                        {/* End: card-header */}
                        {/* Begin: card-body */}
                        {examResults && (
                            <div
                                className={styles.Body}
                                style={{ padding: 10 }}
                            >
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
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examResults.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.exam.title}</td>
                                                <td>
                                                    {formatExamLevel(
                                                        item.exam.level
                                                    )}
                                                </td>
                                                <td>{item.score.toFixed(2)}</td>
                                                <td>
                                                    <div
                                                        className='table-link'
                                                        onClick={() =>
                                                            nav(
                                                                `/study/exam/${item.exam._id}`
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
                                {examResults.length === 0 && (
                                    <div className={styles.empty}>
                                        <img
                                            src='/images/oops.png'
                                            alt='image'
                                        />
                                        <h3>Bạn chưa làm bài kiểm tra nào!</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* End: card-body */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamStatisPage;
