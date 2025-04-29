import React, { useState, useEffect } from "react";
import axios from "axios";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import "./CoursePage.css";
import SubjectList from "../../components/SubjectList/SubjectList";

const CoursePage = () => {
    const API = constants.API;
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/course`);
                setCourses(res.data.data);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Đăng nhập thất bại");
                }
            }
        };

        fetchData();
    }, [API]);
    return (
        <div className='container'>
            <div className='course-page-wrapper'>
                {courses.length > 0 ? (
                    <div className='course-list'>
                        {courses.map((course, index) => (
                            <div key={index} className='course'>
                                <div className='title'>{course.title}</div>
                                <SubjectList course={course} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>Không có khóa học</div>
                )}
            </div>
        </div>
    );
};

export default CoursePage;
