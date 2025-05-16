import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./StatisPage.css";
import constants from "../../../utils/constants";
import ChartAverageScore from "../../../components/ChartAverageScore/ChartAverageScore";
import { User, Course, ExamResult } from "../../../services";
import { ChartHistogram, SelectComponent } from "../../../components";
import { useNavigate } from "react-router-dom";

let courseOptions = [];
let subjectOptions = [];

const ExamStatisPage = () => {
    const API = constants.API;
    const nav = useNavigate();
    const { userId } = useContext(AuthContext);
    const [courseId, setCourseId] = useState();
    const [courses, setCourses] = useState([]);
    const [subjectId, setSubjectId] = useState();
    const [subjects, setSubjects] = useState([]);

    const [data, setData] = useState();
    const [examResults, setExamResults] = useState([]);

    useEffect(() => {
        if (userId && subjectId)
            ExamResult.GetHistogramData(userId, subjectId, setExamResults);
    }, [userId, courseId, subjectId]);

    useEffect(() => {
        Course.GetAll(setCourses);
    }, [userId]);

    useEffect(() => {
        if (courses && courses.length > 0) {
            setCourseId(courses[2]._id);
            courseOptions = courses.map((c) => ({
                value: c._id,
                text: c.title,
            }));
            setSubjects(courses[2].subjects);
            setSubjectId(courses[2].subjects[0]._id);
            subjectOptions = courses[2].subjects.map((s) => ({
                value: s._id,
                text: s.title,
            }));
        }
    }, [courses]);

    useEffect(() => {
        if (courseId) {
            User.GetAverageScore(userId, courseId, setData);
            let course = courses.find((c) => c._id === courseId);
            setSubjects(course.subjects);
            setSubjectId(course.subjects[0]._id);
            subjectOptions = course.subjects.map((s) => ({
                value: s._id,
                text: s.title,
            }));
        }
    }, [courseId]);

    return (
        <div className='container'>
            <div className='profile-page' style={{ marginBottom: 100 }}>
                {/* Begin: statis card */}
                <div className='card'>
                    {/* Begin: card-header */}
                    <div className='card-header'>
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
                    <div className='card-body'>
                        {/* Begin: row name */}
                        {data && (
                            <div className='row'>
                                <div className='col-3'>
                                    <div className='text'>
                                        Điểm trung bình các môn học
                                    </div>
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
                <div className='row' style={{ margin: 0, gap: 30 }}>
                    <div className='card' style={{ flex: 3 }}>
                        {/* Begin: card-header */}
                        <div className='card-header'>
                            <div>Phổ điểm môn học</div>
                            <div>
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
                            <div className='card-body'>
                                {/* Begin: row name */}
                                <ChartHistogram examResults={examResults} />
                                {/* End: row name */}
                            </div>
                        )}
                        {/* End: card-body */}
                    </div>

                    <div className='card' style={{ flex: 3 }}>
                        {/* Begin: card-header */}
                        <div className='card-header'>
                            <div>Bài kiểm tra</div>
                        </div>
                        {/* End: card-header */}

                        {/* Begin: card-body */}
                        <div className='card-body' style={{ padding: 0 }}>
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
                                                <td>{item.exam.level}</td>
                                                <td>{item.score.toFixed(2)}</td>
                                                <td>
                                                    <div
                                                        className='table-link'
                                                        onClick={() =>
                                                            nav(
                                                                `/exam/${item.exam._id}`
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
            </div>
        </div>
    );
};

export default ExamStatisPage;
