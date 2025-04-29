import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import constants from "../../utils/constants";
import "./ChapterExamPage.css";
import ExamCard from "../../components/ExamCard/ExamCard";

const ChapterExamPage = () => {
    const API = constants.API;
    const { chapterId } = useParams();
    const [exams, setExams] = useState([]);

    // Fetch lesson
    useEffect(() => {
        const fetchData = async () => {
            try {
                let data; // lesson fetched
                const res = await axios.get(
                    `${API}/chapter/getOne?id=${chapterId}`
                );
                data = res.data;
                setExams(data.exams);
            } catch (err) {}
        };
        fetchData();
    }, [API, chapterId]);
    return (
        <div className='chapter-exam-page-wrapper'>
            <div className='exam-list'>
                {exams.map((exam, index) => (
                    <ExamCard exam={exam} key={index} />
                ))}
            </div>
        </div>
    );
};

export default ChapterExamPage;
