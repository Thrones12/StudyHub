import React, { useContext, useEffect, useRef, useState } from "react";
import styles from ".//TestPage.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";
import * as MuiIcons from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import {
    formatDate,
    formatDurationToMinute,
    formatExamLevel,
    formatTimer,
    formatViews,
} from "../../../utils/Helpers";
import { ExamResult, User } from "../../../services";
import axios from "axios";
import Noti from "../../../utils/Noti";

const TestPage = () => {
    const nav = useNavigate();
    const { examId } = useParams();
    const { user, setUser } = useContext(AuthContext);
    const [isSaved, setIsSaved] = useState(false);
    const [state, setState] = useState("not_start"); // not_start, start, done, review
    const [inputs, setInputs] = useState();
    const questionRefs = useRef([]);
    const [result, setResult] = useState({});
    useEffect(() => {
        async function postView(userId, link, examId) {
            try {
                const res = await axios.post(
                    "http://localhost:8080/api/user/history",
                    {
                        userId,
                        link,
                        examId,
                    }
                );
                setUser(res.data);
            } catch (err) {}
        }
        if (user && examId) {
            postView(user._id, `/study/exam/${examId}`, examId);
        }
    }, [examId, user]);
    // Lấy dữ liệu exam
    const { data: exam, refetch } = useFetch({
        url: examId ? `http://localhost:8080/api/exam/${examId}` : null,
        method: "GET",
        enabled: !!examId, // chỉ chạy khi examId có dữ liệu
    });
    // Xử lý dữ liệu ban đầu sau khi fetch exam
    useEffect(() => {
        if (exam) {
            setInputs(
                exam.questions.map((q) => ({
                    question: q,
                    input: "",
                    state: "not_done",
                }))
            );
            setResult({});
        }
        if (exam && user) {
            setIsSaved(user.saves.find((item) => item === exam._id));
        }
    }, [exam, user]);
    // Xử lý khi người dùng chọn đáp án
    const hanldeCheck = (questionIndex, option) => {
        setInputs(
            inputs.map((q, i) =>
                i === questionIndex
                    ? { question: q.question, input: option, state: "checked" }
                    : q
            )
        );
    };
    // Xử lý khi người dùng nộp bài
    const handleSubmit = async (timeLeft) => {
        let trueCount = 0;
        let duration = exam.duration - timeLeft;

        // Bước 1: xử lý input thành kết quả cuối cùng
        const processedInputs = inputs.map((item) => {
            if (item.state === "checked") {
                const isCorrect =
                    item.input.trim() === item.question.correctAnswer.trim();

                if (isCorrect) trueCount++;

                return {
                    ...item,
                    state: isCorrect ? "true" : "false",
                };
            } else {
                return item; // giữ nguyên state "not_done"
            }
        });

        // Bước 2: tính điểm
        const score = Number(((trueCount / inputs.length) * 10).toFixed(1));

        // Bước 3: gọi API tạo kết quả
        try {
            const res = await ExamResult.Create({
                exam: examId,
                user: user._id,
                chapterId: exam.chapterId,
                score,
                duration,
                answers: processedInputs,
            });

            if (res) {
                // Bước 4: Nếu kết quả được lưu trữ thành công thì hiển thị kết quả
                setState("done");
                setResult(res);
                // Set lại inputs để hỗ trợ review
                setInputs(processedInputs);
            }
        } catch (error) {
            console.error("Lỗi khi nộp bài:", error);
        } finally {
        }
    };
    // Xử lý làm lại
    const handleRedo = async () => {
        // Thay đổi trạng thái
        setState("not_start");
        refetch();
    };
    // Xử lý xem lại
    const handleReview = async () => {
        setState("review");
    };
    // Xử lý bắt đầu làm bài
    const handleStart = async () => {
        setState("start");
        scrollOnTop();
    };
    function scrollOnTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // cuộn mượt, bỏ nếu muốn cuộn ngay lập tức
        });
    }
    // Xử lý lưu trữ / hủy lưu bài kiểm tra
    const handleSave = async () => {
        let res = await User.Save({ userId: user._id, examId: exam._id });
        setIsSaved(res.isSaved);
        setUser(res.user);
    };
    return (
        <div className={styles.Wrapper}>
            {user && exam && inputs && (
                <>
                    {/* Header */}
                    <div className={styles.Header}>
                        {/* Back */}
                        <Tooltip title='Quay lại'>
                            <div
                                className={`${styles.AbsolutePosition} ${styles.Button}`}
                                style={{
                                    top: "15px",
                                    left: "15px",
                                    cursor: "pointer",
                                }}
                                onClick={() => nav(-1)}
                            >
                                <MuiIcons.KeyboardBackspaceOutlined
                                    className={styles.Icon}
                                />
                            </div>
                        </Tooltip>
                        {/* Header title */}
                        <div className={styles.HeaderTitle}>
                            <div className={styles.FlexColumn}>
                                <div className={styles.Main}>{exam.title}</div>
                                <div
                                    className={styles.Sub}
                                >{`${exam.courseTitle} - ${exam.subjectTitle}`}</div>
                            </div>
                            <div className={styles.FlexRow}>
                                <div
                                    className={`${styles.FlexRow} ${styles.Button}`}
                                >
                                    <MuiIcons.AlarmOutlined />
                                    <p>
                                        {formatDurationToMinute(exam.duration)}
                                    </p>
                                </div>
                                <div
                                    className={`${styles.FlexRow} ${styles.Button}`}
                                >
                                    <MuiIcons.HelpOutlineOutlined />
                                    <p>{exam.questions.length} câu hỏi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Danh sách câu hỏi */}
                    <div className={styles.TestContent}>
                        <div className={styles.Questions}>
                            {exam.questions.map((question, index) => (
                                <div
                                    key={index}
                                    className={styles.Question}
                                    ref={(el) =>
                                        (questionRefs.current[index] = el)
                                    }
                                >
                                    <div className={styles.Index}>
                                        {"Câu " + (index + 1)}
                                    </div>
                                    <div className={styles.Content}>
                                        {question.content}
                                    </div>
                                    {question.options.map((option, opIndex) => (
                                        <div
                                            key={opIndex}
                                            className={`${
                                                styles.OptionWrapper
                                            } ${
                                                state === "review"
                                                    ? styles.Disabled
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                hanldeCheck(index, option)
                                            }
                                        >
                                            <div className={styles.Index}>
                                                {opIndex === 0
                                                    ? "A"
                                                    : opIndex === 1
                                                    ? "B"
                                                    : opIndex === 2
                                                    ? "C"
                                                    : "D"}
                                            </div>
                                            <div
                                                key={opIndex}
                                                className={`${styles.Option} ${
                                                    inputs[index].state ===
                                                        "checked" &&
                                                    inputs[index].input ===
                                                        option
                                                        ? styles.Checked
                                                        : ""
                                                } ${
                                                    inputs[index].question
                                                        .correctAnswer ===
                                                        option &&
                                                    inputs[index].state ===
                                                        "true"
                                                        ? styles.True
                                                        : ""
                                                } ${
                                                    inputs[index].state ===
                                                        "false" &&
                                                    inputs[index].input ===
                                                        option
                                                        ? styles.False
                                                        : ""
                                                }`}
                                            >
                                                {option}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Control */}
                    <>
                        <Control
                            state={state}
                            exam={exam}
                            inputs={inputs}
                            setInputs
                            refs={questionRefs}
                            onSubmit={handleSubmit}
                        />
                    </>
                    {/* Modal start */}
                    <>
                        <ModalStart
                            isOpen={state === "not_start"}
                            onStart={handleStart}
                            exam={exam}
                            isSaved={isSaved}
                            onSave={handleSave}
                        />
                    </>
                    {/* Modal result */}
                    <>
                        <ModalResult
                            isOpen={state === "done"}
                            onReview={handleReview}
                            onRedo={handleRedo}
                            result={result}
                            exam={exam}
                            isSaved={isSaved}
                            onSave={handleSave}
                            user={user}
                        />
                    </>
                </>
            )}
        </div>
    );
};

export default TestPage;

function Control({ state, exam, inputs, refs, onSubmit }) {
    const [timer, setTimer] = useState(exam.duration);
    // Xử lí timer
    useEffect(() => {
        if (state === "start") {
            if (timer <= 0) {
                onSubmit();
                return;
            }

            const timeout = setTimeout(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearTimeout(timeout);
        } else if (state === "not_start") {
            setTimer(exam.duration);
        }
    }, [timer, state, onSubmit, exam.duration]);
    // Click vào các ref của câu hỏi để scroll nhanh
    const refClick = (index) => {
        const headerOffset = 70; // chiều cao header
        const element = refs.current[index];
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = window.scrollY + elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    };
    return (
        <div className={styles.Control}>
            <div className={styles.ControlHeader}>Bộ điều khiển</div>
            <div className={styles.Timer}>
                <MuiIcons.AccessAlarmOutlined />
                <p>{formatTimer(timer)}</p>
            </div>
            <div className={styles.Inputs}>
                {inputs.map((input, index) => (
                    <div
                        key={index}
                        onClick={() => refClick(index)}
                        className={`${styles.Input} ${
                            input.state === "checked"
                                ? styles.Checked
                                : input.state === "true"
                                ? styles.True
                                : input.state === "false"
                                ? styles.False
                                : ""
                        }`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
            {state === "review" ? (
                <div
                    className={`${styles.Button} ${styles.BlueButton}`}
                    onClick={() => onSubmit(timer)}
                >
                    Làm lại
                </div>
            ) : (
                <div
                    className={`${styles.Button} ${styles.GreenButton}`}
                    onClick={() => onSubmit(timer)}
                >
                    Nộp bài
                </div>
            )}
        </div>
    );
}
function ModalStart({ isOpen, onStart, exam, isSaved, onSave }) {
    const nav = useNavigate();
    return (
        <>
            {isOpen && <div className={styles.Overlay}></div>}
            <div className={`${styles.Modal} ${isOpen ? styles.open : ""}`}>
                <div className={styles.FlexRow}>
                    <div className={styles.FlexColumn}>
                        <div className={styles.ExamTitle}>{exam.title}</div>
                        <div
                            className={styles.ExamSubTitle}
                        >{`${exam.courseTitle} - ${exam.subjectTitle}`}</div>
                    </div>
                    <div
                        className={styles.FlexColumn}
                        style={{ alignItems: "end" }}
                    >
                        <div className={styles.CreatedAt}>
                            {`Ngày tạo: ${formatDate(exam.updatedAt)}`}
                        </div>
                        <div className={styles.Author}>
                            {`Tác giả: `}
                            <span style={{ fontWeight: "bold" }}>
                                {exam.author}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.ExamInfo}>
                    {/* Lượt làm bài */}
                    <div className={styles.Item}>
                        <div
                            className={styles.InfoIcon}
                            style={{ backgroundColor: "#e6f0ff" }}
                        >
                            <MuiIcons.PersonOutlined
                                style={{ color: "#1473e6" }}
                            />
                        </div>
                        <div className={styles.FlexColumn}>
                            <p>Lượt làm bài</p>
                            <h3>{formatViews(exam.attemps)}</h3>
                        </div>
                    </div>
                    {/* Điểm trung bình */}
                    <div className={styles.Item}>
                        <div
                            className={styles.InfoIcon}
                            style={{ backgroundColor: "#e6f9f0" }}
                        >
                            <MuiIcons.EmojiEventsOutlined
                                style={{ color: "#16a34a" }}
                            />
                        </div>
                        <div className={styles.FlexColumn}>
                            <p>Điểm trung bình</p>
                            <h3>{exam.averageScore.toFixed(1)}</h3>
                        </div>
                    </div>
                    {/* Đánh giá */}
                    <div className={styles.Item}>
                        <div
                            className={styles.InfoIcon}
                            style={{ backgroundColor: "#fff9db" }}
                        >
                            <MuiIcons.StarOutlineOutlined
                                style={{ color: "#d99606" }}
                            />
                        </div>
                        <div className={styles.FlexColumn}>
                            <p>Đánh giá</p>
                            <h3>{exam.rating.overall}</h3>
                        </div>
                    </div>
                    {/* Số lượng câu hỏi */}
                    <div className={styles.Item}>
                        <div
                            className={styles.InfoIcon}
                            style={{ backgroundColor: "#f1f1f1" }}
                        >
                            <MuiIcons.HelpOutlineOutlined />
                        </div>
                        <div
                            className={styles.FlexColumn}
                            style={{ color: "#6b7284" }}
                        >
                            <p>Số lượng câu hỏi</p>
                            <h3>{exam.questions.length}</h3>
                        </div>
                    </div>
                    {/* Thời gian làm bài */}
                    <div className={styles.Item}>
                        <div
                            className={styles.InfoIcon}
                            style={{ backgroundColor: "#ccfbf1" }}
                        >
                            <MuiIcons.AccessAlarmsOutlined
                                style={{ color: "#0d9488" }}
                            />
                        </div>
                        <div className={styles.FlexColumn}>
                            <p>Thời gian làm bài</p>
                            <h3>{formatDurationToMinute(exam.duration)}</h3>
                        </div>
                    </div>
                    {/* Độ khó */}
                    <div className={styles.Item}>
                        <div
                            className={styles.InfoIcon}
                            style={{ backgroundColor: "#feeceb" }}
                        >
                            <MuiIcons.LocalFireDepartmentOutlined
                                style={{ color: "#dc2626" }}
                            />
                        </div>
                        <div className={styles.FlexColumn}>
                            <p>Độ khó</p>
                            <h3>{formatExamLevel(exam.level)}</h3>
                        </div>
                    </div>
                </div>
                <div className={styles.Buttons}>
                    {/* Back */}
                    <Tooltip title='Quay lại'>
                        <div
                            className={`${styles.Button} ${styles.IconButton}`}
                            onClick={() => nav(-1)}
                        >
                            <MuiIcons.KeyboardBackspaceOutlined
                                className={styles.Icon}
                            />
                        </div>
                    </Tooltip>
                    <div
                        className={`${styles.Button} ${styles.GreenButton}`}
                        onClick={onStart}
                    >
                        Bắt đầu
                    </div>
                    {/* Save */}
                    <Tooltip title='Lưu trữ'>
                        <div
                            className={`${styles.Button} ${styles.IconButton}`}
                            onClick={onSave}
                        >
                            {isSaved ? (
                                <MuiIcons.Bookmark className={styles.Icon} />
                            ) : (
                                <MuiIcons.BookmarkBorder
                                    className={styles.Icon}
                                />
                            )}
                        </div>
                    </Tooltip>
                </div>
            </div>
        </>
    );
}
function ModalResult({
    isOpen,
    onReview,
    onRedo,
    result,
    exam,
    isSaved,
    onSave,
    user,
}) {
    const nav = useNavigate();
    const [topData, setTopData] = useState();
    const [currentUserRank, setCurrentUserRank] = useState(0);
    const [currentUser, setCurrentUser] = useState([]);
    // Lấy dữ liệu xếp hạng
    const { data: ranked } = useFetch({
        url: exam
            ? `http://localhost:8080/api/examResult/rank/${exam._id}`
            : null,
        method: "GET",
        enabled: !!exam, // chỉ chạy khi examId có dữ liệu
    });
    useEffect(() => {
        if (ranked) {
            setTopData(ranked.slice(0, 5));
            // Tìm vị trí người dùng hiện tại
            let currentUserId = user._id;
            const currentUserIndex = ranked.findIndex(
                (userId) => userId === currentUserId
            );
            setCurrentUserRank(currentUserIndex + 1);
            setCurrentUser(ranked[currentUserIndex]);
        }
    }, [ranked, user._id]);

    // RATING
    const [average, setAverage] = useState(exam.rating.overall);
    // Xử lý đánh giá của người dùng
    const [userRate, setUserRate] = useState(0);
    useEffect(() => {
        let rateOfUser = exam.rating.details.find(
            (detail) => detail.userId === user._id
        );
        if (rateOfUser) {
            setUserRate(rateOfUser.rate);
        }
    }, [user, exam.rating.details]);
    // Xử lý đánh giá trong exam
    const [ratings, setRatings] = useState([0, 0, 0, 0, 0]);
    useEffect(() => {
        if (exam && exam.rating && Array.isArray(exam.rating.details)) {
            const counts = [0, 0, 0, 0, 0];

            exam.rating.details.forEach(({ rate }) => {
                if (rate >= 1 && rate <= 5) {
                    counts[5 - rate]++; // 5 sao vào index 0, 4 sao vào index 1, ...
                }
            });

            setRatings(counts);
        }
    }, [exam]);
    const total = ratings.reduce((sum, count) => sum + count, 0);

    const handleRating = async () => {
        try {
            let res = await axios.put(`http://localhost:8080/api/exam/rate`, {
                examId: exam._id,
                userId: user._id,
                rate: userRate,
            });
            const counts = [0, 0, 0, 0, 0];

            res.data.rating.details.forEach(({ rate }) => {
                if (rate >= 1 && rate <= 5) {
                    counts[5 - rate]++; // 5 sao vào index 0, 4 sao vào index 1, ...
                }
            });

            setRatings(counts);
            setAverage(res.data.rating.overall);
            Noti.success("Đánh giá thành công!");
        } catch (err) {
            if (err.response && err.response.data?.message) {
                Noti.error(err.response.data.message);
            } else {
                Noti.error("Đánh giá thất bại");
            }
        }
    };
    return (
        <>
            {isOpen && <div className={styles.Overlay}></div>}
            <div className={`${styles.Modal} ${isOpen ? styles.open : ""}`}>
                {/* Kết quả làm bài */}
                <div className={styles.FlexColumn}>
                    <div className={styles.FlexRow}>
                        <div className={styles.Title}>Kết quả làm bài</div>
                        <div
                            className={styles.FlexRow}
                            style={{
                                marginBottom: 15,
                                alignItems: "center",
                                gap: 15,
                            }}
                        >
                            <div
                                className={`${styles.FlexRow} ${styles.Button}`}
                            >
                                <MuiIcons.AlarmOutlined />
                                <p>{formatDurationToMinute(exam.duration)}</p>
                            </div>
                            <div
                                className={`${styles.FlexRow} ${styles.Button}`}
                            >
                                <MuiIcons.HelpOutlineOutlined />
                                <p>{exam.questions.length} câu hỏi</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.ExamInfo}>
                        {/* Thời gian làm bài */}
                        <div className={styles.Item}>
                            <div
                                className={styles.InfoIcon}
                                style={{ backgroundColor: "#ccfbf1" }}
                            >
                                <MuiIcons.AccessAlarmsOutlined
                                    style={{ color: "#0d9488" }}
                                />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Thời gian làm bài</p>
                                <h3>{formatTimer(result.duration)}</h3>
                            </div>
                        </div>
                        {/* Điểm số */}
                        <div className={styles.Item}>
                            <div
                                className={styles.InfoIcon}
                                style={{ backgroundColor: "#e6f0ff" }}
                            >
                                <MuiIcons.MilitaryTechOutlined
                                    style={{ color: "#1473e6" }}
                                />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Điểm số</p>
                                <h3>
                                    {typeof result?.score === "number"
                                        ? result.score.toFixed(1)
                                        : "0.0"}
                                </h3>
                            </div>
                        </div>
                        {/* Điểm trung bình */}
                        <div className={styles.Item}>
                            <div
                                className={styles.InfoIcon}
                                style={{ backgroundColor: "#fff9db" }}
                            >
                                <MuiIcons.EmojiEventsOutlined
                                    style={{ color: "#d99606" }}
                                />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Điểm trung bình</p>
                                <h3>{exam.averageScore.toFixed(1)}</h3>
                            </div>
                        </div>
                        {/* Số câu đã làm */}
                        <div className={styles.Item}>
                            <div
                                className={styles.InfoIcon}
                                style={{ backgroundColor: "#f1f1f1" }}
                            >
                                <MuiIcons.HelpOutlineOutlined />
                            </div>
                            <div
                                className={styles.FlexColumn}
                                style={{ color: "#6b7284" }}
                            >
                                <p>Số câu đã làm</p>
                                <h3>
                                    {exam.questions.length -
                                        result.notDoneCount}
                                </h3>
                            </div>
                        </div>
                        {/* Số câu đúng */}
                        <div className={styles.Item}>
                            <div
                                className={styles.InfoIcon}
                                style={{ backgroundColor: "#e6f9f0" }}
                            >
                                <MuiIcons.TaskAlt
                                    style={{ color: "#16a34a" }}
                                />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Số câu đúng</p>
                                <h3>{result.trueCount}</h3>
                            </div>
                        </div>
                        {/* Số câu sai */}
                        <div className={styles.Item}>
                            <div
                                className={styles.InfoIcon}
                                style={{ backgroundColor: "#feeceb" }}
                            >
                                <MuiIcons.HighlightOff
                                    style={{ color: "#dc2626" }}
                                />
                            </div>
                            <div className={styles.FlexColumn}>
                                <p>Số câu sai</p>
                                <h3>{result.falseCount}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Xếp hạng và đánh giá */}
                <div className={styles.FlexRow} style={{ gap: 15 }}>
                    {/* Xếp hạng */}
                    {topData && ranked && (
                        <div className={styles.FlexColumn} style={{ flex: 6 }}>
                            <div className={styles.Title}>Xếp hạng</div>
                            <div className={styles.RankingTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Thứ hạng</th>
                                            <th>Tên</th>
                                            <th>Điểm</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Hiển thị top 5 hoặc ít hơn */}
                                        {topData.map((item, index) => {
                                            const globalIndex =
                                                ranked.findIndex(
                                                    (u) =>
                                                        u.userId === item.userId
                                                );
                                            const isCurrentUser =
                                                item.userId === user._id;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={
                                                        isCurrentUser
                                                            ? styles.highlight
                                                            : ""
                                                    }
                                                >
                                                    <td>#{globalIndex + 1}</td>
                                                    <td>{item.name}</td>
                                                    <td>
                                                        {item.score.toFixed(1)}
                                                    </td>
                                                    <td>
                                                        {formatTimer(
                                                            item.duration
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* Bổ sung hàng trống nếu ít hơn 5 */}
                                        {Array.from({
                                            length: Math.max(
                                                0,
                                                5 - topData.length
                                            ),
                                        }).map((_, i) => (
                                            <tr key={`empty-${i}`}>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            </tr>
                                        ))}

                                        {/* Thêm kết quả của người dùng nếu không nằm trong top 5 */}
                                        {currentUserRank > 5 && (
                                            <tr
                                                key={currentUser.id}
                                                className={styles.highlight}
                                            >
                                                <td>#{currentUserRank}</td>
                                                <td>{currentUser.name}</td>
                                                <td>
                                                    {currentUser.score.toFixed(
                                                        1
                                                    )}
                                                </td>
                                                <td>
                                                    {formatTimer(
                                                        currentUser.duration
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* Đánh giá */}
                    {userRate && ratings && (
                        <div
                            className={styles.FlexColumn}
                            style={{ flex: 4, justifyContent: "start" }}
                        >
                            <div className={styles.Title}>Đánh giá</div>
                            <div className={styles.RatingBox}>
                                <div className={styles.left}>
                                    <div className={styles.average}>
                                        {average.toFixed(1)}
                                    </div>
                                    <div className={styles.stars}>
                                        {[...Array(5)].map((_, i) =>
                                            i < userRate ? (
                                                <MuiIcons.StarOutlined
                                                    key={i}
                                                    style={{ color: "#fbbf24" }}
                                                    onClick={() =>
                                                        setUserRate(i + 1)
                                                    }
                                                />
                                            ) : (
                                                <MuiIcons.StarOutlineOutlined
                                                    key={i}
                                                    style={{ color: "#fbbf24" }}
                                                    onClick={() =>
                                                        setUserRate(i + 1)
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                    <div className={styles.count}>
                                        <MuiIcons.PersonOutlined /> {total} đánh
                                        giá
                                    </div>
                                    <button
                                        className={styles.rateBtn}
                                        onClick={() => handleRating()}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                                <div className={styles.right}>
                                    {[5, 4, 3, 2, 1].map((star, i) => {
                                        const count = ratings[5 - star];
                                        const percent = total
                                            ? (count / total) * 100
                                            : 0;
                                        return (
                                            <div
                                                key={star}
                                                className={styles.barRow}
                                            >
                                                <span
                                                    className={styles.starLabel}
                                                >
                                                    <MuiIcons.StarOutlineOutlined />{" "}
                                                    {star}
                                                </span>
                                                <div className={styles.bar}>
                                                    <div
                                                        className={styles.fill}
                                                        style={{
                                                            width: `${percent}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className={styles.count}>
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Button */}
                <div className={styles.Buttons}>
                    {/* Back */}
                    <Tooltip title='Quay lại'>
                        <div
                            className={`${styles.Button} ${styles.IconButton}`}
                            onClick={() => nav(-1)}
                        >
                            <MuiIcons.KeyboardBackspaceOutlined
                                className={styles.Icon}
                            />
                        </div>
                    </Tooltip>
                    <div
                        className={`${styles.Button} ${styles.YellowButton}`}
                        onClick={onReview}
                    >
                        Xem lại
                    </div>
                    <div
                        className={`${styles.Button} ${styles.BlueButton}`}
                        onClick={onRedo}
                    >
                        Làm lại
                    </div>
                    {/* Save */}
                    <Tooltip title='Lưu trữ'>
                        <div
                            className={`${styles.Button} ${styles.IconButton}`}
                            onClick={onSave}
                        >
                            {isSaved ? (
                                <MuiIcons.Bookmark className={styles.Icon} />
                            ) : (
                                <MuiIcons.BookmarkBorder
                                    className={styles.Icon}
                                />
                            )}
                        </div>
                    </Tooltip>
                </div>
            </div>
        </>
    );
}
