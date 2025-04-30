import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChalkboardTeacher,
    faBookOpen,
    faPenFancy,
    faComments,
    faClose,
    faBookmark,
    faSync,
} from "@fortawesome/free-solid-svg-icons";
import {
    VideoLesson,
    PDFViewer,
    ExerciseCard,
    ModalSave,
    ModalAddStorage,
} from "../../components";
import { AuthContext } from "../../context/AuthContext";
import constants from "../../utils/constants";
import { useParams, useOutletContext } from "react-router-dom";
import Noti from "../../utils/Noti";
import axios from "axios";
import "./StudyPage.css";

const StudyPage = () => {
    const API = constants.API;
    const { lessonId } = useParams();
    const { userId } = useContext(AuthContext);
    const { triggerRefreshAside } = useOutletContext();
    const [user, setUser] = useState();
    const [lesson, setLesson] = useState();
    const [toolSelect, setToolSelect] = useState(null); // For toggle
    const [refresh, setRefresh] = useState(false); // State để trigger useEffect
    // Exercise
    const [exerciseTypes, setExerciseTypes] = useState();
    const [results, setResults] = useState([]);
    // Comment
    const [comment, setComment] = useState("");
    // Handle done lesson
    const [isDoneVideo, setIsDoneVideo] = useState(false);
    const [isDoneExercise, setIsDoneExercise] = useState(false);
    // Storage
    const [isShowModalSave, setIsShowModalSave] = useState(false);
    const [isShowModalAdd, setIsShowModalAdd] = useState(false);
    const [storageType, setStorageType] = useState("");
    const [itemStorageId, setItemStorageId] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/user/get-one?id=${userId}`);
                let data = res.data.data;
                setUser(data);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Lỗi khi tải bài học");
                }
            }
        };
        if (userId) {
            fetchData();
        }
    }, [API, userId]);

    // Fetch dữ liệu lesson, phụ thuộc vào user
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${API}/lesson/get-one?id=${lessonId}`
                );
                let data = res.data.data;

                // Sort discussions: Đưa comment của user hiện tại lên đầu
                if (Array.isArray(data.discussions)) {
                    // Đưa comment của user lên đầu
                    const userDiscussion = data.discussions.filter(
                        (discussion) => discussion.user._id === userId
                    );

                    const otherDiscussions = data.discussions.filter(
                        (discussion) => discussion.user._id !== userId
                    );
                    otherDiscussions.sort(
                        (a, b) =>
                            (b.likes?.length || 0) - (a.likes?.length || 0)
                    );

                    // Ghép lại, đưa comment của user lên trên cùng
                    data.discussions = [...userDiscussion, ...otherDiscussions];
                }

                // Exercise type
                setResults(data.exerciseTypes.map(() => false));

                let types = data.exerciseTypes.map((type) => ({
                    ...type,
                    exercise: getRandomExercise(type),
                }));
                setExerciseTypes(types);

                // Nếu không có bài tập nào thì mặc định done exercise
                if (types.length === 0) {
                    setIsDoneExercise(true);
                } else {
                    setIsDoneExercise(false);
                }

                setLesson(data);
                setIsShowModalSave(false);
                setIsShowModalAdd(false);
                setIsDoneVideo(false);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Lỗi khi tải bài học");
                }
            }
        };

        fetchData();
    }, [API, userId, lessonId, refresh]);

    // Handle is done exercise
    useEffect(() => {
        if (
            results.length > 0 && // Bắt đầu thì result = [] nên luôn true điều kiện dưới
            results.every((r) => r === true) &&
            !isDoneExercise // Chưa done bao giờ thì mới thông báo
        ) {
            Noti.success("Bạn đã hoàn thành bài tập");

            setIsDoneExercise(true);
        }
    }, [isDoneExercise, results]);

    // Handle is done lesson
    useEffect(() => {
        const setDoneLesson = async () => {
            try {
                const res = await axios.put(
                    `${API}/user/lesson-done?id=${userId}&lessonId=${lessonId}`
                );
                let user = res.data.data;

                setUser(user);

                triggerRefreshAside();
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data?.message);
                } else {
                    Noti.error("Lỗi khi tải bài học");
                }
            }
        };
        if (isDoneVideo && isDoneExercise && exerciseTypes) {
            setDoneLesson();
            setIsDoneExercise(exerciseTypes.length === 0);
            setIsDoneVideo(false);
        }
    }, [
        API,
        isDoneVideo,
        isDoneExercise,
        exerciseTypes,
        triggerRefreshAside,
        userId,
        lessonId,
    ]);

    const handleToolSelect = (tool) => {
        if (!toolSelect) {
            setToolSelect(tool);
        } else if (tool === toolSelect) setToolSelect(null);
    };
    const handleResult = (index, TF) => {
        setResults(results.map((r, i) => (i === index && TF ? true : r)));
    };
    // EXERCISE
    const getRandomExercise = (type) => {
        const currentId = type.exercise?._id;

        const available = type.exercises.filter((ex) => ex._id !== currentId);

        if (available.length === 0) {
            // Nếu không còn bài nào khác
            return type.exercise; // hoặc return null;
        }

        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    };
    const handleResetExercise = (index) => {
        setExerciseTypes((prevTypes) => {
            const updatedTypes = [...prevTypes]; // clone mảng gốc

            const type = updatedTypes[index];
            const newExercise = getRandomExercise(type);

            updatedTypes[index] = {
                ...type,
                exercise: newExercise,
            };

            return updatedTypes;
        });
    };
    // COMMENT
    const handleLike = async (discuss) => {
        if (discuss.likes.some((like) => like._id === user._id)) {
            // Unlike
            await axios.put(`${API}/discuss/${discuss._id}/unlike`, {
                userId: user._id,
            });
        } else {
            // Like
            await axios.put(`${API}/discuss/${discuss._id}/like`, {
                userId: user._id,
            });
        }

        // Toggle refresh state để useEffect chạy lại
        setRefresh((prev) => !prev);
    };
    const setSrcLikeImg = (likes) => {
        return likes.some((element) => element._id === user._id)
            ? "/icons/liked.png"
            : "/icons/like.png";
    };
    const submitDiscuss = async () => {
        if (!comment.trim()) return; // Kiểm tra không gửi comment rỗng

        try {
            await axios.post(`${API}/discuss`, {
                lessonId, // ID của bài học
                userId: user._id, // ID của người dùng
                message: comment,
            });

            setComment(""); // Xóa nội dung input sau khi gửi

            // Toggle refresh state để useEffect chạy lại
            setRefresh((prev) => !prev);
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
        }
    };
    // STORAGE
    const toggleSave = (storage, itemId) => {
        setIsShowModalSave(true);
        setStorageType(storage);
        setItemStorageId(itemId);
    };
    return (
        <div style={{ position: "relative", height: "100%" }}>
            {" "}
            <div className='container' key={lessonId}>
                {lesson && user && (
                    <div className='study-page'>
                        <VideoLesson
                            lesson={lesson}
                            setIsDoneVideo={setIsDoneVideo}
                        />
                        {/* Tài liệu */}
                        <div
                            className={`document ${
                                toolSelect === "document" ? "active" : ""
                            }`}
                        >
                            <div className='title'>Tài liệu</div>
                            <PDFViewer document={lesson.documentUrl} />
                        </div>
                        {/* Hướng dẫn */}
                        <div
                            className={`guide ${
                                toolSelect === "guide" ? "active" : ""
                            }`}
                        >
                            <div className='title'>Hướng dẫn</div>

                            <PDFViewer document={lesson.guideUrl} />
                        </div>
                        {/* Bài tập */}
                        <div
                            className={`exercise ${
                                toolSelect === "exercise" ? "active" : ""
                            }`}
                        >
                            <div className='title'>Bài tập</div>
                            <div className='exercise-type-list'>
                                {exerciseTypes &&
                                    exerciseTypes.map((type, index) => (
                                        <div
                                            className='exercise-type-item'
                                            key={index}
                                        >
                                            <div className='exercise-type-title'>
                                                <div style={{ flex: 1 }}>
                                                    {type.name}
                                                </div>
                                                <FontAwesomeIcon
                                                    icon={faBookmark}
                                                    onClick={() =>
                                                        toggleSave(
                                                            "exercise",
                                                            type.exercise._id
                                                        )
                                                    }
                                                />
                                                <FontAwesomeIcon
                                                    icon={faSync}
                                                    onClick={() =>
                                                        handleResetExercise(
                                                            index
                                                        )
                                                    }
                                                />
                                            </div>
                                            <ExerciseCard
                                                index={index}
                                                item={type.exercise}
                                                handleResult={handleResult}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                        {/* Thảo luận */}
                        <div
                            className={`discussion ${
                                toolSelect === "discussion" ? "active" : ""
                            }`}
                        >
                            <div className='title'>Thảo luận</div>
                            <div className='comment-section'>
                                {lesson.discussions.map((discuss, index) => (
                                    <div className='comment' key={index}>
                                        <img
                                            src={discuss.user.avatar}
                                            alt='Avatar'
                                            className='avatar'
                                        />
                                        <div className='comment-content'>
                                            <p className='username'>
                                                {discuss.user.fullname}
                                            </p>
                                            <p className='comment-text'>
                                                {discuss.message}
                                            </p>
                                            <button
                                                className='like-btn'
                                                onClick={() =>
                                                    handleLike(discuss)
                                                }
                                            >
                                                <img
                                                    src={setSrcLikeImg(
                                                        discuss.likes
                                                    )}
                                                    alt='icon'
                                                />{" "}
                                                <span className='like-count'>
                                                    {discuss.likes.length}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='comment-input'>
                                <input
                                    type='text'
                                    placeholder='Viết bình luận...'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button onClick={(e) => submitDiscuss()}>
                                    Gửi
                                </button>
                            </div>
                        </div>
                        {/* Lưu trữ */}
                        <div
                            className={`storage-toggle`}
                            onClick={() => toggleSave("lesson", lesson._id)}
                        >
                            <FontAwesomeIcon icon={faBookmark} />
                        </div>
                        {/* TOGGLE */}
                        <div
                            className={`document-toggle toggle ${
                                toolSelect === "document" ? "active" : ""
                            }`}
                            onClick={() => handleToolSelect("document")}
                        >
                            {toolSelect && toolSelect === "document" ? (
                                <FontAwesomeIcon icon={faClose} />
                            ) : (
                                <FontAwesomeIcon icon={faChalkboardTeacher} />
                            )}
                        </div>
                        <div
                            className={`guide-toggle toggle ${
                                toolSelect === "guide" ? "active" : ""
                            }`}
                            onClick={() => handleToolSelect("guide")}
                        >
                            {toolSelect && toolSelect === "guide" ? (
                                <FontAwesomeIcon icon={faClose} />
                            ) : (
                                <FontAwesomeIcon icon={faBookOpen} />
                            )}
                        </div>
                        <div
                            className={`exercise-toggle toggle ${
                                toolSelect === "exercise" ? "active" : ""
                            }`}
                            onClick={() => handleToolSelect("exercise")}
                        >
                            {toolSelect && toolSelect === "exercise" ? (
                                <FontAwesomeIcon icon={faClose} />
                            ) : (
                                <FontAwesomeIcon icon={faPenFancy} />
                            )}
                        </div>
                        <div
                            className={`discussion-toggle toggle ${
                                toolSelect === "discussion" ? "active" : ""
                            }`}
                            onClick={() => handleToolSelect("discussion")}
                        >
                            {toolSelect && toolSelect === "discussion" ? (
                                <FontAwesomeIcon icon={faClose} />
                            ) : (
                                <FontAwesomeIcon icon={faComments} />
                            )}
                        </div>

                        <ModalSave
                            storageType={storageType}
                            isShow={isShowModalSave}
                            setIsShow={setIsShowModalSave}
                            itemId={itemStorageId}
                            setIsShowModalAdd={setIsShowModalAdd}
                        />
                        <ModalAddStorage
                            isShow={isShowModalAdd}
                            setIsShow={setIsShowModalAdd}
                            setRefresh={setRefresh}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyPage;
