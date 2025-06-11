import React, { useState, useEffect } from "react";
import styles from "./CoursePage.module.scss";
import useFetch from "../../../hooks/useFetch";
import { MainLayoutTools, MainLayoutHeader } from "../../../components";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faEye } from "@fortawesome/free-solid-svg-icons";
import { formatViews } from "../../../utils/Helpers";
import Noti from "../../../utils/Noti";

const CoursePage = () => {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState([]);
    const [quickFilter, setQuickFilter] = useState([]);
    const [filterValue, setFilterValue] = useState([]);
    // Lấy dữ liệu khóa học
    const { data: courses, loading } = useFetch({
        url: `http://localhost:8080/api/course`,
        method: "GET",
    });
    // Xử lí dữ liệu hiển thị (lọc và sắp xếp)
    useEffect(() => {
        if (courses && courses.length > 0) {
            setData([...courses]);
        }
    }, [courses]);
    // Thêm giá trị vào bộ lọc
    useEffect(() => {
        if (courses && courses.length > 0) {
            let courseFilters = courses.map((course) => ({
                label: course.title,
                value: course._id,
            }));

            setFilters([
                { title: "Chương trình", options: [...courseFilters] },
            ]);
            setQuickFilter([
                courseFilters[0],
                courseFilters[1],
                courseFilters[2],
            ]);
        }
    }, [courses]);
    const onFilter = (filterValue) => {
        setFilterValue(filterValue);
        if (filterValue.length === 0) {
            setData([...courses]);
        } else {
            setData(
                courses.filter((course) => filterValue.includes(course._id))
            );
        }
    };
    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <MainLayoutHeader />
            {/* Tools */}
            {filters && (
                <MainLayoutTools
                    filters={filters}
                    quickFilter={quickFilter}
                    onFilter={onFilter}
                    selectFilter={filterValue}
                />
            )}
            {/* Content */}
            <div className={styles.container}>
                {loading ? (
                    <div>Đang tải dữ liệu...</div>
                ) : data && data.length > 0 ? (
                    // Render course list
                    <div className={styles.courseList}>
                        {data.map((course, index) => (
                            // Render each course
                            <div key={index} className={styles.course}>
                                {/* Course title */}
                                <div className={styles.title}>
                                    {course.title}
                                </div>
                                {/* Subject list */}
                                <SubjectListCard courseId={course._id} />
                                {index !== data.length - 1 && (
                                    <div className={styles.horizonline}></div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noCourse}>
                        <img src='/images/oops.png' alt='image' />
                        <h3>Ôi không!</h3>
                        <p>Hiện tại hệ thống không có khóa học nào phù hợp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursePage;

const SubjectListCard = ({ courseId }) => {
    const nav = useNavigate();
    // Lấy dữ liệu môn học
    const { data: subjects } = useFetch({
        url: `http://localhost:8080/api/subject?courseId=${courseId}`,
        method: "GET",
        deps: [courseId],
    });
    const handleNavigate = (subject) => {
        if (
            subject.chapters.length > 0 &&
            subject.chapters[0].lessons.length > 0
        ) {
            nav(`/study/lesson/${subject.chapters[0].lessons[0]}`);
        } else {
            Noti.info("Môn học hiện chưa có bài giảng.");
        }
    };
    return (
        <div className={styles.subjects}>
            {subjects &&
                subjects.map((subject) => (
                    <div
                        key={subject._id}
                        className={styles.subject}
                        onClick={() => handleNavigate(subject)}
                    >
                        <img
                            src={
                                subject?.image !== ""
                                    ? subject.image
                                    : "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749486154/images_mlysti.jpg"
                            }
                            alt='image'
                        />
                        <div className={styles.title}>{subject.title}</div>
                        <div className={styles.author}>{subject.author}</div>
                        <div className={styles.info}>
                            <div className={styles.infoItem}>
                                <FontAwesomeIcon icon={faBook} />
                                <p>{subject.lessonCount} bài học</p>
                            </div>
                            <div className={styles.infoItem}>
                                <FontAwesomeIcon icon={faEye} />
                                <p>{formatViews(subject.views)} lượt xem</p>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
};
