import React, { useEffect, useState } from "react";
import "./ExamPage.css";
import axios from "axios";
import constant from "../../utils/constants";
import Noti from "../../utils/Noti";
import { EmptyData, ExamCard, Pagination } from "../../components";

const ExamPage = () => {
    const API = constant.API;
    const [courses, setCourses] = useState();
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState();
    const [courseOption, setCourseOption] = useState("all");
    const [subjectOption, setSubjectOption] = useState("all");
    const [levelOption, setLevelOption] = useState("all");
    const [sortOption, setSortOption] = useState("best");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch exam
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await axios.get(`${API}/exam`, {
                    params: {
                        course: courseOption,
                        subject: subjectOption,
                        level: levelOption,
                        sort: sortOption,
                        page: currentPage,
                    },
                });

                setExams(res.data.data);
                setTotalPages(res.data.totalPages);
                setCurrentPage(res.data.currentPage);
            } catch (err) {
                setExams([]);
            }
        };

        fetchExams();
    }, [
        API,
        courseOption,
        subjectOption,
        levelOption,
        sortOption,
        currentPage,
    ]);

    // Fetch course
    useEffect(() => {
        const fetchExams = async () => {
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

        fetchExams();
    }, [API]);

    useEffect(() => {
        if (courseOption === "all") {
            setSubjects([]);
            setSubjectOption("all");
        } else {
            setSubjects(
                courses
                    .filter((c) => c.tag === courseOption)
                    .map((c) => c.subjects)
                    .flat()
            );

            setSubjectOption("all");
        }
    }, [courseOption]);

    return (
        <div className='container'>
            <div className='exam-page'>
                <div className='controls'>
                    <div style={{ flex: 1, display: "flex", gap: 10 }}>
                        {courses && (
                            <select
                                value={courseOption}
                                onChange={(e) =>
                                    setCourseOption(e.target.value)
                                }
                            >
                                <option value='all'>Tất cả</option>
                                {courses.map((c, i) => (
                                    <option key={i} value={c.tag}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={subjectOption}
                            onChange={(e) => setSubjectOption(e.target.value)}
                        >
                            <option value='all'>Tất cả</option>
                            {subjects.map((s, i) => (
                                <option key={i} value={s.tag}>
                                    {s.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <select
                        value={levelOption}
                        onChange={(e) => setLevelOption(e.target.value)}
                    >
                        <option value='all'>Tất cả</option>
                        <option value='easy'>Dễ</option>
                        <option value='medium'>Trung bình</option>
                        <option value='hard'>Khó</option>
                    </select>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value='best'>Tốt nhất</option>
                        <option value='new'>Mới nhất</option>
                        <option value='attempt'>Làm nhiều</option>
                        <option value='save'>Lưu nhiều</option>
                    </select>
                </div>
                {exams && exams.length > 0 ? (
                    <div className='exam-list'>
                        {exams &&
                            exams.map((exam, index) => (
                                <ExamCard key={index} item={exam} />
                            ))}
                    </div>
                ) : (
                    <EmptyData />
                )}
                {/* Pagination */}
                {exams && exams.length > 0 && (
                    <Pagination
                        page={currentPage}
                        setPage={setCurrentPage}
                        total={totalPages}
                    />
                )}
            </div>
        </div>
    );
};

export default ExamPage;
