import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import constants from "../../utils/constants";
import Noti from "../../utils/Noti";
import axios from "axios";
import {
    EmptyData,
    StorageExamCard,
    StorageExerciseCard,
    StorageLessonCard,
} from "../../components";
import "./StorageItemPage.css";

const StorageItemPage = () => {
    const API = constants.API;
    const nav = useNavigate();
    const { userId } = useContext(AuthContext);
    const { storageId } = useParams();
    const [user, setUser] = useState();
    const [storage, setStorage] = useState();
    const [items, setItems] = useState();
    const [reload, setReload] = useState(false); // Để reload lại page mỗi khi xóa

    // Fetch user
    useEffect(() => {
        try {
            const fetchData = async () => {
                const res = await axios.get(`${API}/user/get-one?id=${userId}`);
                let data = res.data.data;

                setUser(data);
            };
            if (userId) {
                fetchData();
            }
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đăng nhập thất bại");
            }
        }
    }, [userId, API]);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const res = await axios.get(
                    `${API}/storage/get-one?id=${storageId}`
                );
                let data = res.data.data;

                setStorage(data);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Đăng nhập thất bại");
                }
            }
        };
        const fetchItems = async () => {
            try {
                const res = await axios.get(
                    `${API}/storage/get-item?id=${storageId}`
                );
                let data = res.data.data;

                setItems(data);
            } catch (err) {}
        };
        if (storageId) {
            fetchStorage();
            fetchItems();
        }
    }, [storageId, API, reload]);

    const isLessonDone = (userLearned, lessonId) => {
        for (const course of userLearned) {
            for (const subject of course.subjects) {
                for (const lesson of subject.lessons) {
                    if (lesson.lessonId === lessonId && lesson.isDone) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    return (
        <div className='container'>
            {storage && user && (
                <div className='storage-item-page'>
                    <div className='title'>{storage.title}</div>
                    {items && items.length > 0 ? (
                        <>
                            {storage.type === "lesson" && (
                                <div className='storage-item-list'>
                                    {items.map((item, index) => {
                                        let isDone = isLessonDone(
                                            user.learned,
                                            item._id
                                        );
                                        return (
                                            <StorageLessonCard
                                                key={index}
                                                item={item}
                                                isDone={isDone}
                                                storage={storage}
                                                setReload={setReload}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {storage.type === "exam" && (
                                <div className='storage-item-list'>
                                    {items.map((item, index) => (
                                        <StorageExamCard
                                            key={index}
                                            item={item}
                                            storage={storage}
                                            setReload={setReload}
                                        />
                                    ))}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "30px",
                                    flexDirection: "column",
                                }}
                            >
                                {storage.type === "exercise" &&
                                    items.map((item, index) => (
                                        <StorageExerciseCard
                                            key={index}
                                            index={index}
                                            item={item}
                                            storage={storage}
                                            setReload={setReload}
                                        />
                                    ))}
                            </div>
                        </>
                    ) : (
                        <EmptyData btnText='Trang lưu trữ' navPath='/storage' />
                    )}
                </div>
            )}
        </div>
    );
};

export default StorageItemPage;
