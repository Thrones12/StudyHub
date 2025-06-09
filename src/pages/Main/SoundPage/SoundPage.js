import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Howl } from "howler";
import { CircleCheckbox, SlideInRightModal } from "../../../components";
import styles from "./SoundPage.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, Switch } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { Typewriter } from "react-simple-typewriter";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Session, TimeFormat, User } from "../../../services";
import dayjs from "dayjs";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";
import Noti from "../../../utils/Noti";
import { normalize } from "../../../utils/Helpers";
import { Todo } from "../../../services/Todo";

const SoundPage = () => {
    const nav = useNavigate();
    const { user } = useContext(AuthContext);
    const [selectedBg, setSelectedBg] = useState("");
    const [selectTool, setSelectTool] = useState(-1);
    // Pomodoro state
    const [isStartPomodoro, setIsStartPomodoro] = useState(false);
    const [pomodoroTitle, setPomodoroTitle] = useState("");
    const [timeleft, setTimeleft] = useState(0);
    const [isMinimal, setIsMinimal] = useState(false);
    // Timer state
    const [isStartTimer, setIsStartTimer] = useState(false);
    const [timerSession, setTimerSession] = useState({});
    const [animations, setAnimations] = useState({
        rain: false,
        snow: false,
    });
    const rainIntervalRef = useRef(null);
    // Load từ localStorage khi mở trang
    useEffect(() => {
        const savedBg = localStorage.getItem("study-bg");
        if (savedBg) setSelectedBg(savedBg);
        else {
            // Background mặc định
            setSelectedBg(
                "https://res.cloudinary.com/ds5lvyntx/image/upload/v1748472736/0e96c4d57ee3e39ae0d99c0adcb98c81_coz7ih.jpg"
            );
        }
    }, []);

    // Cập nhật nền mỗi khi chọn ảnh mới
    useEffect(() => {
        if (selectedBg) {
            document.body.style.background = `url(${selectedBg}) center/cover no-repeat`;
            localStorage.setItem("study-bg", selectedBg);
        }
    }, [selectedBg]);
    // Đóng tool
    const handleCloseTool = () => {
        setSelectTool(-1);
    };
    // Xử lý bắt đầu pomodoro
    const handleStartPomorodo = (title, hour, minute, second, mode) => {
        setSelectTool(-1);
        setIsStartPomodoro(true);
        setPomodoroTitle(title);
        setTimeleft(hour * 3600 + minute * 60 + second);
        setIsMinimal(mode);
    };
    // Xử lý bắt đầu bộ đếm giờ
    const handleStartTimer = (session) => {
        setSelectTool(-1);
        setIsStartTimer(true);
        setTimerSession(session);
    };
    // Xử lý stop timer
    const handleStopTimer = async (session, newTime) => {
        setIsStartTimer(false);
        let res = await Session.Update({
            id: session._id,
            spentTime: Number(((newTime + 60 * 2) / 60).toFixed(0)),
        });
        if (res === true) {
            setSelectTool(2);
        }
    };
    // Xử lý hoàn thành phiên học
    const handleDoneSession = async (session, newTime) => {
        setIsStartTimer(false);
        let res = await Session.Update({
            id: session._id,
            spentTime: Number(((newTime + 60 * 2) / 60).toFixed(0)),
            isDone: true,
        });
        if (res === true) {
            setSelectTool(2);
        }
    };
    // Hiệu ứng mưa rơi
    useEffect(() => {
        const container = document.getElementById("rain");
        if (!container) return;

        clearInterval(rainIntervalRef.current); // clear nếu có từ trước

        if (animations.rain) {
            rainIntervalRef.current = setInterval(() => {
                if (container.childNodes.length >= 100) {
                    clearInterval(rainIntervalRef.current);
                    return;
                }
                createRainDrop(container);
            }, 30); // tạo giọt mới mỗi 30ms
        } else {
            rainIntervalRef.current = setInterval(() => {
                if (container.childNodes.length <= 0) {
                    clearInterval(rainIntervalRef.current);
                    return;
                }
                container.removeChild(container.lastChild);
            }, 30); // xóa từng giọt mỗi 30ms
        }

        return () => {
            clearInterval(rainIntervalRef.current);
        };
    }, [animations.rain]);
    const createRainDrop = (container) => {
        const drop = document.createElement("div");
        drop.classList.add(styles.rainDrop);

        const duration = 1 + Math.random() * 5;
        const height = 20 + Math.random() * 100;
        const left = Math.random() * 100;

        drop.style.left = `${left}vw`;
        drop.style.height = `${height}px`;
        drop.style.animationDuration = `${duration}s`;

        container.appendChild(drop);
    };
    // Hiệu ứng tuyết rơi
    useEffect(() => {
        const snowContainer = document.getElementById("snow");
        const numFlakes = 120;
        let currentCount = 0;

        const interval = setInterval(() => {
            if (!snowContainer || currentCount >= numFlakes) {
                clearInterval(interval);
                return;
            }

            const flake = document.createElement("div");
            flake.classList.add(styles.snowFlake);

            const size = 5 + Math.random() * 5;
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.left = `${Math.random() * 200 - 50}vw`;
            flake.style.opacity = `${0.2 + Math.random() / 2}`;
            flake.style.animationDuration = `${20 + Math.random() * 20}s`;
            snowContainer.appendChild(flake);

            currentCount++;
        }, 50); // thêm 1 bông tuyết mỗi 50ms

        return () => {
            clearInterval(interval);
            if (snowContainer) snowContainer.innerHTML = "";
        };
    }, []);
    return (
        <div
            className={styles.wrapper}
            style={{
                backgroundImage: selectedBg ? `url(${selectedBg})` : "none",
                transition: "background-image 0.5s ease-in-out",
            }}
        >
            {/* Back */}
            <Tooltip title='Quay lại'>
                <div
                    className={styles.button}
                    style={{ top: 10, left: 10 }}
                    onClick={() => nav(-1)}
                >
                    <MuiIcons.KeyboardBackspaceOutlined
                        className={styles.icon}
                    />
                </div>
            </Tooltip>
            {/* Clock */}
            <Clock />
            {/* Tool direction */}
            <Tools selectTool={selectTool} setSelectTool={setSelectTool} />
            {/* Tools */}
            <>
                {user && (
                    <BackgroundTool
                        isOpen={selectTool === 0}
                        handleClose={handleCloseTool}
                        onChangeBackground={setSelectedBg}
                        userId={user._id}
                    />
                )}
                <AmbienceTool
                    isOpen={selectTool === 1}
                    handleClose={handleCloseTool}
                />
                <AnimationTool
                    isOpen={selectTool === 2}
                    handleClose={handleCloseTool}
                    animations={animations}
                    setAnimations={setAnimations}
                />
                {user && (
                    <SessionTool
                        isOpen={selectTool === 3}
                        handleClose={handleCloseTool}
                        onStart={handleStartTimer}
                        userId={user._id}
                    />
                )}
                {user && (
                    <PomodoroTool
                        isOpen={selectTool === 4}
                        handleClose={handleCloseTool}
                        onStart={handleStartPomorodo}
                        isStartPomodoro={isStartPomodoro}
                        userId={user._id}
                    />
                )}
                {user && (
                    <TodoTool
                        isOpen={selectTool === 5}
                        handleClose={handleCloseTool}
                        userId={user._id}
                    />
                )}
            </>
            {/* Pomodoro */}
            {isStartPomodoro && (
                <Pomodoro
                    title={pomodoroTitle}
                    time={timeleft}
                    isMinimal={isMinimal}
                    onStop={() => setIsStartPomodoro(false)}
                />
            )}
            {/* Timer */}
            {isStartTimer && (
                <Timer
                    session={timerSession}
                    onStop={handleStopTimer}
                    onDone={handleDoneSession}
                />
            )}
            {/* Hiệu ứng mưa rơi */}
            <div className={styles.rain} id='rain' />
            {/* Hiệu ứng tuyết rơi */}
            <div
                id='snow'
                className={`${styles.snow} ${
                    animations["snow"] === false ? styles.hide : ""
                }`}
            />
        </div>
    );
};

export default SoundPage;

// Đồng hồ góc trên phải
function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        const pad = (n) => n.toString().padStart(2, "0");
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDate = (date) => {
        const days = [
            "Chủ nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
        ];
        const dayOfWeek = days[date.getDay()];
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${dayOfWeek} | ${day} tháng ${month}, ${year}`;
    };

    return (
        <div className={styles.clock}>
            <div className={styles.time}>{formatTime(time)}</div>
            <div className={styles.date}>{formatDate(time)}</div>
        </div>
    );
}
// Thanh tool phía dưới màn hình
function Tools(props) {
    const { selectTool, setSelectTool } = props;
    const handleSelectTool = (index) => {
        if (selectTool === index) setSelectTool(-1);
        else setSelectTool(index);
    };
    return (
        <div className={styles.tools}>
            {/* Background */}
            <Tooltip title='Hình nền'>
                <div
                    className={`${styles.tool} ${
                        selectTool === 0 ? styles.active : ""
                    }`}
                    onClick={() => handleSelectTool(0)}
                >
                    <MuiIcons.ImageOutlined />
                </div>
            </Tooltip>
            {/* Ambience */}
            <Tooltip title='Âm thanh'>
                <div
                    className={`${styles.tool} ${
                        selectTool === 1 ? styles.active : ""
                    }`}
                    onClick={() => handleSelectTool(1)}
                >
                    <MuiIcons.CloudOutlined />
                </div>
            </Tooltip>
            {/* Animation */}
            <Tooltip title='Hiệu ứng'>
                <div
                    className={`${styles.tool} ${
                        selectTool === 2 ? styles.active : ""
                    }`}
                    onClick={() => handleSelectTool(2)}
                >
                    <MuiIcons.AutoAwesomeMotionOutlined />
                </div>
            </Tooltip>
            {/* Session */}
            <Tooltip title='Phiên học'>
                <div
                    className={`${styles.tool} ${
                        selectTool === 3 ? styles.active : ""
                    }`}
                    onClick={() => handleSelectTool(3)}
                >
                    <MuiIcons.ClassOutlined />
                </div>
            </Tooltip>
            {/* Pomo */}
            <Tooltip title='Bộ đếm giờ'>
                <div
                    className={`${styles.tool} ${
                        selectTool === 4 ? styles.active : ""
                    }`}
                    onClick={() => handleSelectTool(4)}
                >
                    <MuiIcons.AccessAlarmOutlined />
                </div>
            </Tooltip>
            {/* Todo */}
            <Tooltip title='Công việc'>
                <div
                    className={`${styles.tool} ${
                        selectTool === 5 ? styles.active : ""
                    }`}
                    onClick={() => handleSelectTool(5)}
                >
                    <MuiIcons.PlaylistAddCheckOutlined />
                </div>
            </Tooltip>
        </div>
    );
}
// Công cụ chỉnh sử hình nền (background)
function BackgroundTool(props) {
    let { userId, isOpen, handleClose, onChangeBackground } = props;
    // Index của theme được chọn
    const [select, setSelect] = useState(0);
    // Danh sách theme (tập hợp các background theo chủ đề)
    const [themes, setThemes] = useState([]);
    // Lấy dữ liệu theme
    const { data } = useFetch({
        url: `http://localhost:8080/api/theme`,
        method: "GET",
    });
    // Thêm 1 theme do người dùng tùy chỉnh vào themes
    useEffect(() => {
        if (data) {
            let custom = {
                name: "Tùy chỉnh",
                icon: "AddPhotoAlternateOutlined",
                images: [],
            };
            setThemes([custom, ...data]);
        }
    }, [data]);
    // Lấy dữ liệu custom theme của user
    const { data: userThemes, refetch } = useFetch({
        url: `http://localhost:8080/api/theme?userId=${userId}`,
        method: "GET",
    });
    // ref đến nút thêm background
    const fileInputRef = useRef(null);
    // Mở folder máy tính
    const handleIconClick = () => {
        fileInputRef.current?.click();
    };
    // Xử lý khi chọn ảnh từ máy tính
    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        document.body.style.cursor = "wait";
        try {
            await User.AddImageToTheme(userId, file);
            refetch();
        } catch (error) {
            console.error("Lỗi thêm ảnh");
        } finally {
            document.body.style.cursor = "default";
        }
    };
    // Xử lý xóa hình ảnh
    const handleDeleteCustomBackground = async (image) => {
        document.body.style.cursor = "wait";
        try {
            await User.DeleteImageOfTheme(userId, image);
            refetch();
        } catch (error) {
            console.error("Lỗi xóa ảnh");
        } finally {
            document.body.style.cursor = "default";
        }
    };
    return (
        <div
            className={`${styles.backgroundTool} ${isOpen ? styles.open : ""}`}
        >
            {/* Nút close tool */}
            <MuiIcons.CloseOutlined
                className={styles.closeBtn}
                onClick={handleClose}
            />
            <div className={styles.header}>Hình nền</div>
            <p>Danh mục</p>
            {themes.length > 0 && (
                <>
                    {/* Danh sách theme */}
                    <div className={styles.categories}>
                        {themes.map((theme, index) => {
                            const Icon = MuiIcons[theme.icon];
                            return (
                                <div
                                    key={index}
                                    className={`${styles.category} ${
                                        select === index ? styles.active : ""
                                    }`}
                                    onClick={() => setSelect(index)}
                                >
                                    <Icon />
                                    {theme.name}
                                </div>
                            );
                        })}
                    </div>
                    {/* Danh sách background của theme được chọn */}
                    <p>{themes[select].name}</p>
                    {select === 0 ? (
                        // Background của người dùng tùy chỉnh
                        <div className={styles.images}>
                            {/* Nút thêm background mới */}
                            <div
                                className={`${styles.image}`}
                                onClick={handleIconClick}
                            >
                                <MuiIcons.AddOutlined />
                                <input
                                    type='file'
                                    accept='image/*'
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                            {userThemes.map((image, index) => (
                                <div
                                    key={index}
                                    className={`${styles.image}`}
                                    onClick={() => onChangeBackground(image)}
                                >
                                    <img src={image} alt='img' />
                                    <MuiIcons.Cancel
                                        className={styles.deleteIcon}
                                        onClick={() =>
                                            handleDeleteCustomBackground(image)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Background trong theme do hệ thống cung cấp
                        <div className={styles.images}>
                            {themes[select].images.map((image) => (
                                <div
                                    className={`${styles.image}`}
                                    onClick={() => onChangeBackground(image)}
                                >
                                    <img src={image} alt='img' />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
// Công cụ phát âm thanh nền
function AmbienceTool(props) {
    const { isOpen, handleClose } = props;
    const [isPlay, setIsPlay] = useState(false);
    const [playing, setPlaying] = useState({});
    const [volumes, setVolumes] = useState({});
    // Lấy dữ liệu sounds
    const { data: sounds } = useFetch({
        url: `http://localhost:8080/api/sound`,
        method: "GET",
    });
    // Xử lý dữ liệu khi fetch thành công
    useEffect(() => {
        if (sounds) {
            setVolumes(
                sounds.reduce((acc, sound) => ({ ...acc, [sound.name]: 1 }), {})
            );
        }
    }, [sounds]);
    // Tạm dừng / tiếp tục phát âm thanh
    const togglePlay = () => {
        if (isPlay) {
            // Nếu đang phát → tạm dừng toàn bộ
            Object.values(playing).forEach((howl) => {
                if (howl) howl.pause();
            });
            setIsPlay(false);
        } else {
            // Nếu đang dừng → tiếp tục phát toàn bộ
            Object.values(playing).forEach((howl) => {
                if (howl) howl.play();
            });
            setIsPlay(true);
        }
    };
    // Xử lý khi click vào sound
    const toggleSound = (sound) => {
        if (playing[sound.name]) {
            playing[sound.name].stop();
            setPlaying((prev) => ({ ...prev, [sound.name]: null }));
        } else {
            const howl = new Howl({
                src: [sound.src],
                loop: true,
                volume: volumes[sound.name],
            });
            if (isPlay) {
                howl.play();
            } else {
                howl.pause();
            }
            setPlaying((prev) => ({ ...prev, [sound.name]: howl }));
        }
    };
    // Thay đổi âm lượng của sound
    const changeVolume = (sound, value) => {
        setVolumes((prev) => ({ ...prev, [sound.name]: value }));
        if (playing[sound.name]) {
            playing[sound.name].volume(value);
        }
    };
    return (
        <div className={`${styles.ambienceTool} ${isOpen ? styles.open : ""}`}>
            <MuiIcons.CloseOutlined
                className={styles.closeBtn}
                onClick={handleClose}
            />
            <div className={styles.header}>
                Âm thanh
                {isPlay ? (
                    <Tooltip title='Tạm dừng'>
                        <MuiIcons.PauseCircleOutlined onClick={togglePlay} />
                    </Tooltip>
                ) : (
                    <Tooltip title='Tiếp tục'>
                        <MuiIcons.PlayCircleOutlined onClick={togglePlay} />
                    </Tooltip>
                )}
            </div>
            <div className={styles.sounds}>
                {sounds &&
                    sounds.map((sound, index) => {
                        const Icon = MuiIcons[sound.icon];
                        return (
                            <Tooltip key={index} title={sound.name}>
                                <div className={styles.sound}>
                                    <Icon
                                        className={`${
                                            playing[sound.name]
                                                ? styles.active
                                                : ""
                                        }`}
                                        onClick={() => toggleSound(sound)}
                                    />
                                    <input
                                        className={`${styles.soundVolume} ${
                                            playing[sound.name]
                                                ? styles.active
                                                : ""
                                        }`}
                                        type='range'
                                        min='0'
                                        max='1'
                                        step='0.01'
                                        value={volumes[sound.name] || 1}
                                        onChange={(e) =>
                                            changeVolume(
                                                sound,
                                                parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </Tooltip>
                        );
                    })}
            </div>
        </div>
    );
}
// Công cụ tạo hiệu ứng
function AnimationTool(props) {
    const { isOpen, handleClose, animations, setAnimations } = props;
    const handleAnimations = (animation) => {
        setAnimations((prev) => ({
            ...prev,
            [animation]: !prev[animation],
        }));
    };
    return (
        <div className={`${styles.animationTool} ${isOpen ? styles.open : ""}`}>
            <MuiIcons.CloseOutlined
                className={styles.closeBtn}
                onClick={handleClose}
            />
            <div className={styles.header}>Hiệu ứng</div>
            <div className={styles.animations}>
                <div
                    className={styles.animation}
                    onClick={() => handleAnimations("rain")}
                >
                    <p>Mưa rơi 💦</p>
                    <Switch
                        checked={animations["rain"]}
                        sx={{
                            width: 50,
                            height: 25,
                            padding: 0,
                            boxShadow:
                                "0 0 5px rgba(120, 216, 122, 0.6),0 0 10px rgba(120, 216, 122, 0.6),0 0 15px rgba(120, 216, 122, 0.6)",
                            borderRadius: 26 / 2,
                            "& .MuiSwitch-switchBase": {
                                padding: 0,
                                margin: "2px",
                                transitionDuration: "300ms",
                                "&.Mui-checked": {
                                    transform: "translateX(25px)",
                                    color: "#fff",
                                    "& + .MuiSwitch-track": {
                                        backgroundColor: "#78d87a",
                                        opacity: 1,
                                        border: 0,
                                    },
                                },
                            },
                            "& .MuiSwitch-thumb": {
                                boxSizing: "border-box",
                                width: 21,
                                height: 21,
                            },
                            "& .MuiSwitch-track": {
                                borderRadius: 26 / 2,
                                backgroundColor: "#000",
                                opacity: 1,
                            },
                        }}
                    />
                </div>
                <div
                    className={styles.animation}
                    onClick={() => handleAnimations("snow")}
                >
                    <p>Tuyết rơi ❄</p>
                    <Switch
                        checked={animations["snow"]}
                        sx={{
                            width: 50,
                            height: 25,
                            padding: 0,
                            boxShadow:
                                "0 0 5px rgba(120, 216, 122, 0.6),0 0 10px rgba(120, 216, 122, 0.6),0 0 15px rgba(120, 216, 122, 0.6)",
                            borderRadius: 26 / 2,
                            "& .MuiSwitch-switchBase": {
                                padding: 0,
                                margin: "2px",
                                transitionDuration: "300ms",
                                "&.Mui-checked": {
                                    transform: "translateX(25px)",
                                    color: "#fff",
                                    "& + .MuiSwitch-track": {
                                        backgroundColor: "#78d87a",
                                        opacity: 1,
                                        border: 0,
                                    },
                                },
                            },
                            "& .MuiSwitch-thumb": {
                                boxSizing: "border-box",
                                width: 21,
                                height: 21,
                            },
                            "& .MuiSwitch-track": {
                                borderRadius: 26 / 2,
                                backgroundColor: "#000",
                                opacity: 1,
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
// Phiên học
function SessionTool(props) {
    const { isOpen, onStart, userId } = props;
    const [sessions, setSessions] = useState([]);
    const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectSort, setSelectSort] = useState("Mới nhất");
    // Dữ liệu trong modal phiên học
    const [sessionId, setSessionId] = useState(null);
    const [title, setTitle] = useState("");
    const [targetTime, setTargetTime] = useState("");
    // Fetch dữ liệu phiên học
    const { data, refetch } = useFetch({
        url: `http://localhost:8080/api/session?userId=${userId}`,
        method: "GET",
    });
    // Xử lý dữ liệu phiên học sau khi fetch
    useEffect(() => {
        if (data && data.length > 0) {
            setSessions(data);
        }
    }, [data]);
    // Lấy lại dữ liệu mỗi khi tắt / mở tool
    useEffect(() => {
        if (isOpen === true) refetch();
    }, [isOpen, refetch]);
    // Chuyển phút thành giờ + phút
    function formatMinutes(minutes) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hrs > 0 && mins > 0) return `${hrs} giờ ${mins} phút`;
        if (hrs > 0) return `${hrs} giờ`;
        return `${mins} phút`;
    }
    // Xóa dữ liệu trong modal khi đóng
    const handleCloseModal = () => {
        setSessionId(null);
        setTitle("");
        setTargetTime("");
        setIsOpenModalAdd(false);
    };
    // Xử lý chuyển đổi dữ liệu khi nhập targetTime
    const handleChangeTargetTime = (e) => {
        let val = e.target.value.replace(/\D/g, "");
        setTargetTime(val);
    };
    // Xử lý lưu targetTime khi blur
    const handleSaveTargetTime = () => {
        let val = Number(targetTime);
        let h = Math.floor(val / 60);
        let m = Math.floor(val % 60);

        setTargetTime(`${h !== 0 ? h + " giờ " : ""}${m} phút`);
    };
    // Xử lý khi focus vào input
    const handleFocus = (e) => {
        setTargetTime("");
        e.target.select();
    };
    // Lưu session
    const handleSaveSession = async () => {
        let time = parseTimeToMinutes(targetTime);
        let res;
        if (sessionId) {
            res = await Session.Update({
                id: sessionId,
                title,
                targetTime: time,
            });
        } else {
            res = await Session.Create({
                userId: userId,
                title,
                targetTime: time,
            });
        }
        if (res === true) {
            setIsOpenModalAdd(false);
            setSessionId(null);
            setTitle("");
            setTargetTime("");
            refetch();
        }
    };
    // Chuyển giá trị targetTime -> number
    function parseTimeToMinutes(timeStr) {
        const hourMatch = timeStr.match(/(\d+)\s*giờ/);
        const minuteMatch = timeStr.match(/(\d+)\s*phút/);

        const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

        return hours * 60 + minutes;
    }
    // Xử lý mở edit modal
    const handleOpenEditModal = (session) => {
        setSessionId(session._id);
        setTitle(session.title);
        let val = Number(session.targetTime);
        let h = Math.floor(val / 60);
        let m = Math.floor(val % 60);
        setTargetTime(`${h !== 0 ? h + " giờ " : ""}${m} phút`);
        setIsOpenModalAdd(true);
    };
    // Xử lý thay đổi isDone của session
    const handleSetDone = async (e, session) => {
        e.stopPropagation();

        let res = await Session.Update({
            id: session._id,
            isDone: !session.isDone,
        });
        if (res) {
            refetch();
        }
    };
    // Xử lý bắt đầu bộ đếm
    const handleStartSession = (e, session) => {
        e.stopPropagation();

        onStart(session);
    };
    // Xử lý xóa session
    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        let res = await Session.Delete(id);
        if (res) {
            refetch();
        }
    };
    // Xử lý tìm kiếm và sắp xếp
    useEffect(() => {
        if (!data) return;

        // 1. Normalize và lọc theo searchText
        const searchWords = normalize(searchText).split(" ");
        let filtered = data.filter((session) => {
            const titleWords = normalize(session.title).split(" ");
            return searchWords.every((word) =>
                titleWords.some((titleWord) => titleWord.includes(word))
            );
        });

        // 2. Sắp xếp theo selectSort
        if (selectSort === "Mới nhất") {
            filtered.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        } else if (selectSort === "Cũ nhất") {
            filtered.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
        } else if (selectSort === "Cập nhập mới") {
            filtered.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
        } else if (selectSort === "Cập nhập cũ") {
            filtered.sort(
                (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
            );
        } else if (selectSort === "Tên từ A - Z") {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (selectSort === "Tên từ Z - A") {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
        }

        // 3. Cập nhật sessions
        setSessions(filtered);
    }, [data, searchText, selectSort]);
    return (
        <div>
            <div
                className={`${styles.sessionTool} ${isOpen ? styles.open : ""}`}
            >
                {/* Title */}
                {isOpen && (
                    <div className={styles.Typewriter}>
                        <Typewriter
                            words={["Bắt đầu phiên học của bạn!"]}
                            typeSpeed={70}
                            deleteSpeed={50}
                            delaySpeed={1000}
                        />
                    </div>
                )}
                {/* Nút tạo phiên học mới */}
                <button
                    className={styles.NewSessionBtn}
                    onClick={() => setIsOpenModalAdd(true)}
                >
                    + Phiên học mới
                </button>
                {/* Tìm kiếm và sắp xếp */}
                <div className={styles.Controls}>
                    <div className={`${styles.Control}`}>
                        <MuiIcons.SearchRounded />
                        <input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder='Tìm kiếm'
                        />
                    </div>
                    <div
                        className={`${styles.Control}`}
                        style={{ position: "relative" }}
                    >
                        <MuiIcons.Sort />
                        <p>{selectSort !== "" ? selectSort : "Sắp xếp"}</p>
                        <div className={styles.sortSelect}>
                            <div className={styles.title}>Sắp xếp</div>
                            <div
                                className={`${styles.option} ${
                                    selectSort === "Mới nhất"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setSelectSort("Mới nhất")}
                            >
                                Mới nhất
                            </div>
                            <div
                                className={`${styles.option} ${
                                    selectSort === "Cũ nhất"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setSelectSort("Cũ nhất")}
                            >
                                Cũ nhất
                            </div>
                            <div
                                className={`${styles.option} ${
                                    selectSort === "Cập nhập mới"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setSelectSort("Cập nhập mới")}
                            >
                                Cập nhập mới
                            </div>
                            <div
                                className={`${styles.option} ${
                                    selectSort === "Cập nhập cũ"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setSelectSort("Cập nhập cũ")}
                            >
                                Cập nhập cũ
                            </div>
                            <div
                                className={`${styles.option} ${
                                    selectSort === "Tên từ A - Z"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setSelectSort("Tên từ A - Z")}
                            >
                                Tên từ A - Z
                            </div>
                            <div
                                className={`${styles.option} ${
                                    selectSort === "Tên từ Z - A"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setSelectSort("Tên từ Z - A")}
                            >
                                Tên từ Z - A
                            </div>
                        </div>
                    </div>
                </div>
                {/* Danh sách phiên học */}
                <div className={styles.sessions}>
                    {sessions &&
                        sessions.map((session, index) => (
                            <div
                                key={index}
                                className={styles.session}
                                onClick={() => handleOpenEditModal(session)}
                            >
                                <div className={styles.sessionInfo}>
                                    {/* Tiêu đề */}
                                    <div
                                        key={index}
                                        className={`${styles.title} ${
                                            session.spent >= session.target
                                                ? styles.done
                                                : ""
                                        }`}
                                        style={{
                                            textDecorationLine:
                                                session.isDone === true
                                                    ? "line-through"
                                                    : "",
                                        }}
                                    >
                                        {session.title}
                                    </div>
                                    {/* Trạng thái */}
                                    <div
                                        className={`${
                                            session.isDone === false
                                                ? styles.ongoing
                                                : styles.completed
                                        }`}
                                    >
                                        {session.isDone === false
                                            ? "[ Đang thực hiện ]"
                                            : "[ Đã hoàn thành ]"}
                                    </div>
                                    {/* Thông tin phiên học */}
                                    <div className={styles.moreInfo}>
                                        <div className={styles.info}>
                                            <MuiIcons.SpatialTrackingTwoTone />
                                            <p>
                                                Đã học:{" "}
                                                {formatMinutes(
                                                    session.spentTime
                                                )}
                                            </p>
                                        </div>
                                        {session.targetTime !== 0 && (
                                            <div className={styles.info}>
                                                <MuiIcons.SpatialTrackingTwoTone />
                                                <p>
                                                    Mục tiêu:{" "}
                                                    {formatMinutes(
                                                        session.targetTime
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.controls}>
                                    {session.isDone === false ? (
                                        <MuiIcons.Done
                                            onClick={(e) =>
                                                handleSetDone(e, session)
                                            }
                                        />
                                    ) : (
                                        <MuiIcons.RestartAltOutlined
                                            onClick={(e) =>
                                                handleSetDone(e, session)
                                            }
                                        />
                                    )}
                                    <MuiIcons.PlayArrowOutlined
                                        onClick={(e) =>
                                            handleStartSession(e, session)
                                        }
                                    />
                                    <MuiIcons.DeleteForeverOutlined
                                        onClick={(e) =>
                                            handleDeleteSession(e, session._id)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            {/* Modal tạo phiên học mới */}
            <div
                className={`${styles.overlay} ${
                    isOpenModalAdd ? styles.open : ""
                }`}
                onClick={handleCloseModal}
            ></div>
            <div
                className={`${styles.modalAddNewSession} ${
                    isOpenModalAdd ? styles.open : ""
                }`}
            >
                {/* Close icon */}
                <MuiIcons.CloseOutlined
                    className={styles.deleteIcon}
                    onClick={handleCloseModal}
                />
                {/* Title */}
                <div className={styles.title}>🍀 Tạo phiên học mới</div>
                {/* Input title */}
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.titleInput}
                    placeholder='Nhập tiêu đề cho phiên học'
                />
                {/* Mục tiêu */}
                <div className={styles.flexRow}>
                    <MuiIcons.HourglassTop />
                    <p>Mục tiêu:</p>
                    <input
                        value={targetTime}
                        onChange={(e) => handleChangeTargetTime(e)}
                        onBlur={handleSaveTargetTime}
                        onFocus={(e) => handleFocus(e)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.target.blur();
                            }
                        }}
                        className={styles.time}
                        placeholder='phút'
                    />
                </div>
                {/* Các button */}
                <div
                    className={styles.flexRow}
                    style={{ justifyContent: "center" }}
                >
                    <button style={{ borderColor: "#78d87a" }}>Bắt đầu</button>
                    <button onClick={handleSaveSession}>Lưu lại</button>
                </div>
            </div>
        </div>
    );
}
// Bộ đếm giờ
function Timer({ session, onStop, onDone }) {
    const [counter, setCounter] = useState(session.spentTime * 60);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef(null);
    // Đếm ngược
    useEffect(() => {
        if (
            isRunning &&
            (counter < session.targetTime * 60 || session.targetTime === 0)
        ) {
            intervalRef.current = setInterval(() => {
                setCounter((prev) => prev + 1);
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, counter, session.targetTime]);
    // Khi bộ đếm hoàn thành mục tiêu
    useEffect(() => {
        if (counter >= session.targetTime * 60 && session.targetTime !== 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            Noti.success("Thành công");
        }
    }, [counter, session.targetTime]);
    // Xử lý bắt đầu / tạm dừng
    const toggleStartPause = () => {
        if (isRunning) {
            setIsRunning(false);
        } else {
            setIsRunning(true);
        }
    };
    // Format time hiển thị
    const formatTime = (time) => String(time).padStart(2, "0");
    const h = Math.floor(counter / 3600);
    const m = Math.floor((counter % 3600) / 60);
    const s = counter % 60;
    // Xử lý dừng bộ đếm
    const handleStopTimer = () => {
        setIsRunning(false);
        onStop(session, counter);
    };
    // Xử lý hoàn thành phiên học
    const handleDoneSession = () => {
        setIsRunning(false);
        onDone(session, counter);
    };
    return (
        <div className={styles.PomodoroSpotlight}>
            <div className={styles.title}>{session.title || "Tập trung"}</div>
            {/* Thời gian */}
            <div className={styles.timeleft}>
                {formatTime(h) !== "00" ? `${formatTime(h)}:` : ""}
                {formatTime(m)}:{formatTime(s)}
            </div>
            {/* Bộ điều khiển */}
            <div className={styles.controls}>
                {isRunning ? (
                    <Tooltip title='Tạm dừng'>
                        <MuiIcons.Pause onClick={toggleStartPause} />
                    </Tooltip>
                ) : (
                    <Tooltip title='Tiếp tục'>
                        <MuiIcons.PlayArrow onClick={toggleStartPause} />
                    </Tooltip>
                )}
                <Tooltip title='Dừng lại'>
                    <MuiIcons.Stop onClick={handleStopTimer} />
                </Tooltip>
                <Tooltip title='Hoàn thành'>
                    <MuiIcons.CheckCircle onClick={handleDoneSession} />
                </Tooltip>
            </div>
        </div>
    );
}
// Pomodoro
function PomodoroTool(props) {
    const { isOpen, handleClose, onStart, isStartPomodoro } = props;
    const [title, setTitle] = useState("");
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("25");
    const [second, setSecond] = useState("00");
    const [isMinimalismMode, setIsMinimalismMode] = useState(false);

    // Xử lý việc change giá trị time
    const handleChange = (e, type) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 2) val = val.slice(0, 2);
        if (type === 0) {
            // Giờ
            setHour(val);
        } else if (type === 1) {
            // Phút
            setMinute(val);
        } else {
            // Giây
            setSecond(val);
        }
    };
    // Xử lý lưu giá trị time
    const handleBlur = (type) => {
        if (type === 0) {
            // Giờ
            const formatted = hour.padStart(2, "0");
            setHour(formatted);
        } else if (type === 1) {
            // Phút
            const formatted = minute.padStart(2, "0");
            setMinute(formatted);
        } else {
            // Giây
            const formatted = second.padStart(2, "0");
            setSecond(formatted);
        }
    };
    // Xử lý bắt đầu đếm giờ
    const handleStart = () => {
        if (isStartPomodoro) {
            Noti.info("Vui lòng tắt bộ đếm giờ đang chạy trước.");
        } else {
            onStart(
                title,
                Number(hour),
                Number(minute),
                Number(second),
                isMinimalismMode
            );
        }
    };
    return (
        <div className={`${styles.pomodoroTool} ${isOpen ? styles.open : ""}`}>
            <MuiIcons.CloseOutlined
                className={styles.closeBtn}
                onClick={handleClose}
            />
            {/* Header */}
            <div className={styles.header}>Bộ đếm giờ</div>
            {/* Title */}
            <input
                className={styles.pomoTitle}
                placeholder='Nhấn để nhập tiêu đề'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            {/* Time */}
            <div className={styles.inputTimes}>
                <input
                    value={hour}
                    onChange={(e) => handleChange(e, 0)}
                    onBlur={() => handleBlur(0)}
                    onFocus={(e) => e.target.select()}
                />
                <p>:</p>
                <input
                    value={minute}
                    onChange={(e) => handleChange(e, 1)}
                    onBlur={() => handleBlur(1)}
                    onFocus={(e) => e.target.select()}
                />
                <p>:</p>
                <input
                    value={second}
                    onChange={(e) => handleChange(e, 2)}
                    onBlur={() => handleBlur(2)}
                    onFocus={(e) => e.target.select()}
                />
            </div>
            {/* Time label */}
            <div className={styles.timeLabels}>
                <span>Giờ</span>
                <span>Phút</span>
                <span>Giây</span>
            </div>
            {/* Mode */}
            <button
                className={styles.modeBtn}
                onClick={() => setIsMinimalismMode(!isMinimalismMode)}
            >
                Chế độ: {isMinimalismMode ? "Tối giản" : "Tiêu điểm"}
            </button>
            {/* Start */}
            <button className={styles.startBtn} onClick={handleStart}>
                Bắt đầu
            </button>
        </div>
    );
}
// Pomodoro hiển thị khi start
function Pomodoro({ title, time, onStop, isMinimal }) {
    const [timeLeft, setTimeLeft] = useState(time);
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef(null);
    // Đếm ngược
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                setProgress((oldProgress) => {
                    if (oldProgress === 100) {
                        return 0;
                    }
                    const diff = (1 / time) * 100;
                    return Math.min(oldProgress + diff, 100);
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, time, timeLeft]);
    // Khi timeLeft = 0 thì dừng
    useEffect(() => {
        if (timeLeft <= 0) {
            setTimeLeft(0);
            clearInterval(intervalRef.current);
            setIsRunning(false);
            onStop();
        }
    }, [timeLeft, onStop]);
    // Xử lý bắt đầu / tạm dừng
    const toggleStartPause = () => {
        if (isRunning) {
            setIsRunning(false);
        } else {
            setIsRunning(true);
        }
    };
    // Format time hiển thị
    const formatTime = (time) => String(time).padStart(2, "0");
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    if (isMinimal)
        return (
            <div className={styles.PomodoroMinimal}>
                {/* Hover để hiển thị*/}
                <div className={styles.topInfo}>
                    <div className={styles.title}>{title || "Tập trung"}</div>
                    <div className={styles.timerAndControls}>
                        <div className={styles.timeleft}>
                            {formatTime(h) !== "00" ? `${formatTime(h)}:` : ""}
                            {formatTime(m)}:{formatTime(s)}
                        </div>
                        <div className={styles.controls}>
                            {isRunning ? (
                                <Tooltip title='Tạm dừng'>
                                    <MuiIcons.Pause
                                        onClick={toggleStartPause}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip title='Tiếp tục'>
                                    <MuiIcons.PlayArrow
                                        onClick={toggleStartPause}
                                    />
                                </Tooltip>
                            )}
                            <Tooltip title='Dừng lại'>
                                <MuiIcons.Stop onClick={onStop} />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                {/* Thanh tiến trình */}
                <div className={styles.progress}>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p>{progress.toFixed(0)}%</p>
                </div>
                {/* Thời gian trước hover*/}
                <div className={styles.timeleftBottom}>
                    {formatTime(h) !== "00" ? `${formatTime(h)}:` : ""}
                    {formatTime(m)}:{formatTime(s)}
                </div>
            </div>
        );
    else {
        return (
            <div className={styles.PomodoroSpotlight}>
                <div className={styles.title}>{title || "Tập trung"}</div>
                {/* Thời gian */}
                <div className={styles.timeleft}>
                    {formatTime(h) !== "00" ? `${formatTime(h)}:` : ""}
                    {formatTime(m)}:{formatTime(s)}
                </div>
                {/* Thanh tiến trình */}
                <div className={styles.progress}>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p>{progress.toFixed(0)}%</p>
                </div>
                {/* Bộ điều khiển */}
                <div className={styles.controls}>
                    <Tooltip title='Giảm thời gian'>
                        <MuiIcons.Remove
                            onClick={() => setTimeLeft(timeLeft - 300)}
                        />
                    </Tooltip>
                    {isRunning ? (
                        <Tooltip title='Tạm dừng'>
                            <MuiIcons.Pause onClick={toggleStartPause} />
                        </Tooltip>
                    ) : (
                        <Tooltip title='Tiếp tục'>
                            <MuiIcons.PlayArrow onClick={toggleStartPause} />
                        </Tooltip>
                    )}
                    <Tooltip title='Dừng lại'>
                        <MuiIcons.Stop onClick={onStop} />
                    </Tooltip>
                    <Tooltip title='Thêm thời gian'>
                        <MuiIcons.Add
                            onClick={() => setTimeLeft(timeLeft + 300)}
                        />
                    </Tooltip>
                </div>
            </div>
        );
    }
}
// Công việc
function TodoTool(props) {
    const { userId, isOpen } = props;
    const [lists, setLists] = useState([]);
    const [listSelect, setListSelect] = useState(0);
    const [listSelectTitle, setListSelectTitle] = useState("");
    const [isCompletedTasksOpen, setIsCompletedTasksOpen] = useState(false);
    const [isOpenTaskModal, setIsOpenTaskModal] = useState(false);
    // Fetch dữ liệu công việc
    const { data, refetch } = useFetch({
        url: `http://localhost:8080/api/todo?userId=${userId}`,
        method: "GET",
    });
    // Xử lý dữ liệu công việc sau khi fetch
    useEffect(() => {
        if (data && data.length > 0) {
            handleGroupTask(data);
            setListSelect(0);
            setListSelectTitle(data[0].name);
        } else {
            setListSelect(-1);
            setListSelectTitle("");
        }
    }, [data]);
    const handleGroupTask = (data) => {
        setLists(
            data.map((list) => {
                let inCompletedTasks = list.tasks.filter(
                    (task) => task.completed === false
                );
                let completedTasks = list.tasks.filter(
                    (task) => task.completed === true
                );
                return {
                    _id: list._id,
                    order: list.order,
                    name: list.name,
                    inCompletedTasks,
                    completedTasks,
                };
            })
        );
    };
    // Xử lý kéo thả task
    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEndInCompletedTask = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = parseInt(active.id);
        const newIndex = parseInt(over.id);

        const updatedTasks = arrayMove(
            lists[listSelect].inCompletedTasks,
            oldIndex,
            newIndex
        );
        const updatedLists = [...lists];
        updatedLists[listSelect].inCompletedTasks = updatedTasks;

        setLists(updatedLists);
    };
    const handleDragEndCompletedTask = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = parseInt(active.id);
        const newIndex = parseInt(over.id);

        const updatedTasks = arrayMove(
            lists[listSelect].completedTasks,
            oldIndex,
            newIndex
        );
        const updatedLists = [...lists];
        updatedLists[listSelect].completedTasks = updatedTasks;

        setLists(updatedLists);
    };
    // Xử lý chọn list
    const handleSelectlist = (index) => {
        setListSelect(index);
        setListSelectTitle(lists[index].name);
    };
    // Xử lý đổi tên list
    const handleChangeListName = (e) => {
        setListSelectTitle(e.target.value);
    };
    // Xử lý lưu tên list
    const handleSaveListName = async () => {
        const listToSave = [...lists];
        listToSave[listSelect].name = listSelectTitle;
        setLists(listToSave);
        await Todo.Update({ id: lists[listSelect]._id, name: listSelectTitle });
    };
    // Xử lý thêm list mới
    const handleAddList = async () => {
        await Todo.Create({ name: "Danh mục mới", userId });
        refetch();
    };
    // Xử lý xóa list
    const handleDeleteList = async () => {
        await Todo.Delete({ todoId: lists[listSelect]._id, userId });
        refetch();
    };
    // Xử lý thêm task mới
    const handleAddTask = async () => {
        let newList = {
            ...lists[listSelect],
            tasks: [
                ...lists[listSelect].inCompletedTasks,
                ...lists[listSelect].completedTasks,
            ],
        };
        newList.tasks = [
            ...newList.tasks,
            {
                ID: generateNextTaskId(newList.tasks),
                title: "Công việc mới",
            },
        ];

        await Todo.Update({
            id: newList._id,
            tasks: newList.tasks,
        });
        refetch();
    };
    function generateNextTaskId(tasks) {
        // Lọc ra các task có id bắt đầu bằng "TASK-"
        const taskIds = tasks
            .map((task) => task.ID) // hoặc task._id nếu bạn dùng _id
            .filter((id) => typeof id === "string" && id.startsWith("TASK-"));
        console.log(taskIds);

        // Lấy ra số phía sau "TASK-" và chuyển thành số
        const numbers = taskIds
            .map((id) => parseInt(id.replace("TASK-", ""), 10))
            .filter((num) => !isNaN(num)); // loại bỏ NaN nếu có id không hợp lệ
        console.log(numbers);

        // Tìm số lớn nhất
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        console.log(maxNumber);

        // Trả về ID mới
        return `TASK-${maxNumber + 1}`;
    }
    // Xử lý xóa task
    const handleDeleteTask = async (taskId) => {
        let updatedList = {
            ...lists[listSelect],
            tasks: [
                ...lists[listSelect].inCompletedTasks,
                ...lists[listSelect].completedTasks,
            ],
        };
        updatedList.tasks = updatedList.tasks.filter(
            (task) => task._id !== taskId
        );
        await Todo.Update({
            id: updatedList._id,
            tasks: updatedList.tasks,
        });
        refetch();
    };
    // Xử lý check task
    const toggleTaskCompleted = async (taskId) => {
        let updatedList = {
            ...lists[listSelect],
            tasks: [
                ...lists[listSelect].inCompletedTasks,
                ...lists[listSelect].completedTasks,
            ],
        };
        updatedList.tasks = updatedList.tasks.map((task) =>
            task._id === taskId ? { ...task, completed: !task.completed } : task
        );
        await Todo.Update({
            id: updatedList._id,
            tasks: updatedList.tasks,
        });
        refetch();
    };
    const handleOpenModal = (task) => {
        setIsOpenTaskModal(true);
    };
    return (
        <>
            <div className={`${styles.todoTool} ${isOpen ? styles.open : ""}`}>
                {lists.length > 0 && listSelect !== -1 ? (
                    <>
                        {/* Danh mục */}
                        <div className={styles.leftSide}>
                            <div className={styles.lists}>
                                {lists.map((list, index) => (
                                    <div
                                        className={`${styles.list} ${
                                            listSelect === index
                                                ? styles.select
                                                : ""
                                        }`}
                                        key={index}
                                        onClick={() => handleSelectlist(index)}
                                    >
                                        <h3>{list.name}</h3>
                                    </div>
                                ))}
                            </div>
                            <h3
                                className={styles.addText}
                                style={{ textAlign: "center" }}
                                onClick={handleAddList}
                            >
                                + Danh mục
                            </h3>
                        </div>
                        {/* Công việc */}
                        <div className={styles.rightSide}>
                            {/* Tên danh mục được chọn */}
                            <div className={styles.header}>
                                <input
                                    className={styles.listName}
                                    value={listSelectTitle}
                                    onChange={handleChangeListName}
                                    onBlur={handleSaveListName}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSaveListName();
                                            e.target.blur();
                                        }
                                    }}
                                />
                                <MuiIcons.DeleteForeverOutlined
                                    onClick={handleDeleteList}
                                    className='list-delete-icon'
                                />
                            </div>
                            {/* Danh sách công việc */}
                            <div className={styles.tasks}>
                                {/* Incomplete */}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEndInCompletedTask}
                                >
                                    <SortableContext
                                        items={lists[
                                            listSelect
                                        ].inCompletedTasks.map((t, i) =>
                                            i.toString()
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {lists[listSelect].inCompletedTasks
                                            .length > 0 ? (
                                            lists[
                                                listSelect
                                            ].inCompletedTasks.map(
                                                (task, index) => (
                                                    <SortableTask
                                                        key={index}
                                                        id={index.toString()}
                                                        task={task}
                                                        onDelete={
                                                            handleDeleteTask
                                                        }
                                                        onCheck={
                                                            toggleTaskCompleted
                                                        }
                                                        openModal={
                                                            handleOpenModal
                                                        }
                                                    />
                                                )
                                            )
                                        ) : (
                                            <div className={styles.emptyState}>
                                                <p>Không có công việc nào.</p>
                                                <p>
                                                    Nhấn nút{" "}
                                                    <span
                                                        style={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        + Công việc
                                                    </span>{" "}
                                                    bên dưới để thêm công việc
                                                    mới
                                                </p>
                                            </div>
                                        )}
                                    </SortableContext>
                                </DndContext>
                                {/* Complete */}
                                {lists[listSelect].completedTasks.length >
                                    0 && (
                                    <div className={styles.Accordion}>
                                        <div
                                            className={styles.AccordionSummary}
                                            onClick={() =>
                                                setIsCompletedTasksOpen(
                                                    (prev) => !prev
                                                )
                                            }
                                        >
                                            <MuiIcons.ExpandMore
                                                className={
                                                    isCompletedTasksOpen
                                                        ? styles.rotate
                                                        : ""
                                                }
                                            />
                                            <p>Đã hoàn thành</p>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isCompletedTasksOpen && (
                                                <motion.div
                                                    className={
                                                        styles.AccordionDetails
                                                    }
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                        overflow: "hidden",
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: "easeInOut",
                                                    }}
                                                >
                                                    <DndContext
                                                        className={
                                                            isCompletedTasksOpen
                                                                ? styles.open
                                                                : ""
                                                        }
                                                        sensors={sensors}
                                                        collisionDetection={
                                                            closestCenter
                                                        }
                                                        onDragEnd={
                                                            handleDragEndCompletedTask
                                                        }
                                                    >
                                                        <SortableContext
                                                            items={lists[
                                                                listSelect
                                                            ].completedTasks.map(
                                                                (t, i) =>
                                                                    i.toString()
                                                            )}
                                                            strategy={
                                                                verticalListSortingStrategy
                                                            }
                                                        >
                                                            {lists[
                                                                listSelect
                                                            ].completedTasks.map(
                                                                (
                                                                    task,
                                                                    index
                                                                ) => (
                                                                    <SortableTask
                                                                        key={
                                                                            index
                                                                        }
                                                                        id={index.toString()}
                                                                        task={
                                                                            task
                                                                        }
                                                                        isCompleteAccordion={
                                                                            true
                                                                        }
                                                                        onDelete={() =>
                                                                            handleDeleteTask(
                                                                                task._id
                                                                            )
                                                                        }
                                                                        onCheck={
                                                                            toggleTaskCompleted
                                                                        }
                                                                        openModal={
                                                                            handleOpenModal
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </SortableContext>
                                                    </DndContext>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                            {/* Thêm mới công việc */}
                            <h3
                                className={styles.addText}
                                style={{ paddingLeft: 30 }}
                                onClick={handleAddTask}
                            >
                                + Công việc
                            </h3>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <p>Danh mục trống.</p>
                        <p>
                            Bạn chưa có danh mục nào, hãy tạo một danh mục mới
                            để bắt đầu!
                        </p>
                        <h3
                            className={styles.addText}
                            style={{ textAlign: "center" }}
                            onClick={handleAddList}
                        >
                            + Danh mục
                        </h3>
                    </div>
                )}
            </div>
            <SlideInRightModal
                isOpen={isOpenTaskModal}
                onClose={() => setIsOpenTaskModal(false)}
            />
        </>
    );
}
const SortableTask = ({
    task,
    id,
    onDelete,
    onCheck,
    isCompleteAccordion,
    openModal,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "default",
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={styles.task}
            {...attributes}
            onClick={() => openModal(task._id)}
        >
            {/* Nút kéo */}
            <MuiIcons.DragIndicatorOutlined
                className={styles.dragIcon}
                {...listeners}
            />
            <CircleCheckbox
                checked={task.completed}
                onChange={() => onCheck(task)}
            />
            <div className={styles.content}>
                <div
                    className={`${styles.title} ${
                        task.completed === true ? styles.completed : ""
                    }`}
                >
                    {task.title}
                </div>
                {!isCompleteAccordion && (
                    <>
                        <div className={styles.description}>
                            {task.description}
                        </div>
                        {task.endDate && (
                            <div
                                className={`${styles.endDate} ${
                                    TimeFormat.isToday(dayjs(task.endDate))
                                        ? styles.today
                                        : ""
                                } ${
                                    TimeFormat.isOverdue(dayjs(task.endDate))
                                        ? styles.overdue
                                        : ""
                                }`}
                            >
                                <MuiIcons.EventOutlined />
                                {TimeFormat.formatDateTime(task.endDate)}
                                {" | "}
                                {TimeFormat.getTimeRemaining(
                                    dayjs(task.endDate)
                                )}
                            </div>
                        )}
                    </>
                )}
                <MuiIcons.DeleteForeverOutlined
                    onClick={() => onDelete(task._id)}
                    className={styles.deleteIcon}
                />
            </div>
        </div>
    );
};
