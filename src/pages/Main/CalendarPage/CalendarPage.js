import React, { useContext, useEffect, useState } from "react";
import "./CalendarPage.css";
import Calendar from "../../../components/Calendar/Calendar";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { TimeFormat } from "../../../services";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./CalendarPage.module.scss";
import * as MuiIcons from "@mui/icons-material";
import Noti from "../../../utils/Noti";
import useFetch from "../../../hooks/useFetch";
import { CircleCheckbox } from "../../../components";
import { AuthContext } from "../../../context/AuthContext";
import { Todo } from "../../../services/Todo";
import { Tooltip } from "@mui/material";

// animation variants
const variants = {
    initial: (direction) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
        position: "relative",
    }),
    animate: {
        x: 0,
        opacity: 1,
        position: "relative",
        transition: { duration: 0.2 },
    },
    exit: (direction) => ({
        x: direction > 0 ? -50 : 50,
        opacity: 0,
        position: "relative",
        transition: { duration: 0.2 },
    }),
};

const CalendarPage = () => {
    const nav = useNavigate();
    const { user } = useContext(AuthContext);
    // Lấy năm và tháng từ URL nếu có
    const { year, month } = useParams();
    // Khởi tạo currentDate với ngày hiện tại
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [direction, setDirection] = useState(0); // 1: next, -1: prev
    const [reload, setReload] = useState(false);
    // Nếu có year và month thì set currentDate theo chúng
    useEffect(() => {
        if (year && month) {
            setCurrentDate(dayjs(`${year}-${month}-${1}`));
        }
    }, [year, month, reload]);
    // Hàm để chuyển đến tháng hiện tại
    // Hàm này sẽ được gọi khi người dùng nhấn nút "Hôm nay"
    const currentMonth = () => {
        setDirection(0);
        setCurrentDate(dayjs());
    };
    // Hàm để chuyển đến tháng tiếp theo
    const nextMonth = () => {
        setDirection(1);
        let date = currentDate.add(1, "month");
        setCurrentDate(date);
        nav(`/task/${date.year()}/${date.month() + 1}`);
    };
    // Hàm để chuyển đến tháng trước
    const prevMonth = () => {
        setDirection(-1);
        let date = currentDate.subtract(1, "month");
        setCurrentDate(date);
        nav(`/task/${date.year()}/${date.month() + 1}`);
    };

    // MODAL
    // Lấy danh sách todo từ API
    const { data: todos, refetch } = useFetch({
        url: user ? `http://localhost:8080/api/todo?userId=${user._id}` : null,
        method: "GET",
        deps: [user],
    });
    // State để hiển thị modal và dữ liệu form
    // Mặc định là không hiển thị modal và formData rỗng
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        ID: "",
        title: "",
        description: "",
        status: "pending",
        todo: "",
        dueDate: dayjs().format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
        repeat: "none",
        priority: "low",
        completed: false,
    });
    // Hàm để mở modal và tạo mới task
    // Hàm này sẽ được gọi khi người dùng nhấn nút "Tạo mới
    const onAdd = () => {
        resetFormData();
        setShowTaskModal(true);
    };
    // Hàm để tạo ID mới cho task
    // Hàm này sẽ lấy tất cả các task trong todos, lọc ra các task
    // có ID bắt đầu bằng "TASK-", sau đó tìm số lớn nhất và cộng thêm 1
    // để tạo ID mới
    function generateNextTaskId(tasks) {
        // Lọc ra các task có id bắt đầu bằng "TASK-"
        const taskIds = tasks
            .map((task) => task.ID) // hoặc task._id nếu bạn dùng _id
            .filter((id) => typeof id === "string" && id.startsWith("TASK-"));

        // Lấy ra số phía sau "TASK-" và chuyển thành số
        const numbers = taskIds
            .map((id) => parseInt(id.replace("TASK-", ""), 10))
            .filter((num) => !isNaN(num)); // loại bỏ NaN nếu có id không hợp lệ

        // Tìm số lớn nhất
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;

        // Trả về ID mới
        return `TASK-${maxNumber + 1}`;
    }
    // Hàm để chỉnh sửa task
    // Hàm này sẽ nhận vào một task, set formData với dữ liệu của task
    const onEdit = (task) => {
        setFormData({ ...task });
        setShowTaskModal(true);
    };
    // Hàm để hoàn thành hoặc hủy hoàn thành task
    // Hàm này sẽ toggle trạng thái completed của task
    const onCompleted = async () => {
        // Nếu formData._id là rỗng thì không làm gì cả
        if (formData._id === "") {
            Noti.info("Vui lòng tạo công việc trước");
            return;
        }
        // Nếu formData._id không rỗng thì tìm task trong todos
        // và cập nhật trạng thái completed
        if (formData._id !== "") {
            // Tìm todo chứa task cần cập nhật
            let newTodo = todos.find((todo) => todo._id === formData.todo);
            // Tìm task trong todo và cập nhật trạng thái completed
            newTodo.tasks = newTodo.tasks.map((task) =>
                task._id === formData._id
                    ? {
                          ...task,
                          ...formData,
                          completed: !formData.completed,
                          status:
                              !formData.completed === true
                                  ? "completed"
                                  : "doing",
                      }
                    : task
            );
            // Cập nhật lại todo với tasks đã được cập nhật
            await Todo.Update({
                id: newTodo._id,
                tasks: newTodo.tasks,
            });
            // Refetch dữ liệu để cập nhật lại danh sách todos
            refetch();
            // Hiển thị thông báo thành công
            Noti.success("Cập nhật thành công");
            // Cập nhật formData để hiển thị lại trạng thái mới
            setFormData({
                ...formData,
                completed: !formData.completed,
                status: !formData.completed === true ? "completed" : "doing",
            });
        }
    };
    // Hàm để xử lý thay đổi dữ liệu trong form
    // Hàm này sẽ được gọi khi người dùng nhập dữ liệu vào các trường trong form
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Cập nhật formData trước
        let updatedFormData = { ...formData, [name]: value };
        // Kiểm tra nếu endDate < dueDate thì gán lại endDate = dueDate
        if (name === "endDate" || name === "dueDate") {
            const dueDate = new Date(updatedFormData.dueDate);
            const endDate = new Date(updatedFormData.endDate);

            if (
                updatedFormData.endDate &&
                updatedFormData.dueDate &&
                endDate < dueDate
            ) {
                updatedFormData.endDate = updatedFormData.dueDate;
            }
        }
        // Nếu endDate rỗng và repeat là "none", set repeat lại thành "daily"
        if (
            updatedFormData.endDate === "" &&
            updatedFormData.repeat === "none"
        ) {
            updatedFormData.repeat = "daily";
        }

        setFormData(updatedFormData);
    };
    // Hàm để xử lý submit form
    // Hàm này sẽ được gọi khi người dùng nhấn nút "Xác nhận
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Tạo mới
        if (formData._id == "") {
            let newTodo = todos.find((todo) => todo._id === formData.todo);
            const { _id, ...dataWithoutId } = formData;
            newTodo.tasks = [...newTodo.tasks, dataWithoutId];

            await Todo.Update({
                id: newTodo._id,
                tasks: newTodo.tasks,
            });
            refetch();
            Noti.success("Tạo mới thành công");
        }
        // Cập nhập
        else {
            let newTodo = todos.find((todo) => todo._id === formData.todo);
            newTodo.tasks = newTodo.tasks.map((task) =>
                task._id === formData._id ? { ...task, ...formData } : task
            );
            await Todo.Update({
                id: newTodo._id,
                tasks: newTodo.tasks,
            });
            refetch();
            Noti.success("Cập nhập thành công");
        }
        resetFormData();

        setShowTaskModal(false);
    };
    // Hàm để xóa task
    // Hàm này sẽ được gọi khi người dùng nhấn nút "Xóa"
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            let newTodo = todos.find((todo) => todo._id === formData.todo);
            const updatedTasks = newTodo.tasks.filter(
                (task) => task._id !== formData._id
            );
            newTodo.tasks = updatedTasks;

            await Todo.Update({
                id: newTodo._id,
                tasks: newTodo.tasks,
            });
            refetch();
            resetFormData();
            Noti.success("Xóa thành công");
            setShowTaskModal(false);
        };
        Noti.infoWithYesNo({
            title: "Xóa",
            text: "Xác nhận xóa dữ liệu",
            func: () => onDelete(),
        });
    };
    // Hàm để reset formData về giá trị mặc định
    const resetFormData = () => {
        setFormData({
            _id: "",
            ID: generateNextTaskId(todos[0].tasks) || "TASK-1",
            title: "",
            description: "",
            status: "pending",
            todo: todos[0]._id ?? "",
            dueDate: dayjs().format("YYYY-MM-DD"),
            endDate: dayjs().format("YYYY-MM-DD"),
            repeat: "none",
            priority: "low",
            completed: false,
        });
    };
    // Chỉnh sửa danh mục
    const [openTodoModal, setOpenTodoModal] = useState(false);
    const [selectTodo, setSelectTodo] = useState(null);
    // Khi todos thay đổi, set selectTodo là todo đầu tiên
    // Điều này giúp đảm bảo rằng khi người dùng mở modal danh mục,
    // sẽ có một danh mục được chọn mặc định
    useEffect(() => {
        if (todos && todos.length > 0) {
            setSelectTodo(todos[0]);
        }
    }, [todos]);
    // Hàm để xử lý thay đổi tên todo
    // Hàm này sẽ được gọi khi người dùng nhập tên todo mới
    const handleSelectTodoName = (e) => {
        setSelectTodo((prev) => ({ ...prev, name: e.target.value }));
    };
    // Xử lý thêm Todo mới
    const handleAddTodo = async () => {
        await Todo.Create({ name: "Danh mục mới", userId: user._id });
        refetch();
    };
    // Xử lý lưu tên todo
    const handleSaveTodoName = async () => {
        await Todo.Update({ id: selectTodo._id, name: selectTodo.name });
        refetch();
    };
    // Xử lý xóa todo
    const handleDeleteTodo = (e) => {
        e.preventDefault();
        const onDelete = async () => {
            if (todos.length <= 1) {
                Noti.error("Cần ít nhất một danh mục");
                return;
            }
            await Todo.Delete({
                todoId: selectTodo._id,
                userId: user._id,
            });
            refetch();
            Noti.success("Xóa thành công");
        };
        Noti.infoWithYesNo({
            title: "Xóa",
            text: "Xác nhận xóa dữ liệu",
            func: () => onDelete(),
        });
    };
    return (
        <div className={styles.wrapper}>
            <div className='calendar-page' style={{ padding: 0 }}>
                <div className={`controls ${styles.Header}`}>
                    <div className='btn' onClick={currentMonth}>
                        Hôm nay
                    </div>
                    <div className='icon' onClick={prevMonth}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </div>
                    <div className='date'>
                        {TimeFormat.getMonthYear(currentDate)}
                    </div>
                    <div className='icon' onClick={nextMonth}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            justifyContent: "flex-end",
                        }}
                    >
                        <div className={styles.controls}>
                            <div className={styles.button} onClick={onAdd}>
                                <MuiIcons.Add />
                                <p>Tạo mới</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "0 20px" }}>
                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div
                            onWheel={(e) => {
                                if (e.deltaY > 0) {
                                    nextMonth();
                                } else if (e.deltaY < 0) {
                                    prevMonth();
                                }
                            }}
                            key={currentDate.toString()}
                            custom={direction}
                            variants={variants}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                        >
                            <Calendar
                                date={currentDate}
                                setReload={setReload}
                                tasks={
                                    todos
                                        ? todos.flatMap((todo) => todo.tasks)
                                        : []
                                }
                                openTask={onEdit}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Modal */}
                <>
                    {showTaskModal && (
                        <div
                            className={`${styles.overlay}`}
                            onClick={() => {
                                setShowTaskModal(false);
                                resetFormData();
                            }}
                        />
                    )}
                    <div
                        className={`${styles.Modal} ${
                            showTaskModal ? styles.open : ""
                        }`}
                    >
                        <div className={styles.Header}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <CircleCheckbox
                                    checked={formData.completed}
                                    onChange={onCompleted}
                                />
                                <p
                                    style={{
                                        fontWeight: "normal",
                                        fontSize: 16,
                                    }}
                                >
                                    Hoàn thành công việc
                                </p>
                            </div>
                            <div
                                className={styles.button}
                                onClick={() => setShowTaskModal(!showTaskModal)}
                            >
                                <MuiIcons.Close />
                            </div>
                        </div>
                        <div className={styles.Body}>
                            <form
                                onSubmit={handleSubmit}
                                className={styles.Form}
                            >
                                {/* ID */}
                                <div className={styles.Field}>
                                    <label>Mã công việc</label>
                                    <input
                                        type='text'
                                        name='ID'
                                        placeholder='ID'
                                        value={formData.ID}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            if (e.target.value === "") {
                                                setFormData({
                                                    ...formData,
                                                    ID: generateNextTaskId(
                                                        todos.find(
                                                            (todo) =>
                                                                todo._id ===
                                                                formData.todo
                                                        ).tasks
                                                    ),
                                                });
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                {/* title */}
                                <div className={styles.Field}>
                                    <label>Tên công việc</label>
                                    <input
                                        type='text'
                                        name='title'
                                        placeholder='Tên công việc'
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {/* description */}
                                <div className={styles.Field}>
                                    <label>Mô tả</label>
                                    <textarea
                                        name='description'
                                        placeholder='Mô tả'
                                        value={formData.description}
                                        onChange={handleChange}
                                        style={{ resize: "vertical" }}
                                    />
                                </div>
                                {/* status */}
                                <div className={styles.Field}>
                                    <label>Trạng thái</label>
                                    <select
                                        name='status'
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value='pending'>Sắp đến</option>
                                        <option value='doing'>Đang làm</option>
                                        <option value='review'>Xem lại</option>
                                        <option value='completed'>
                                            Hoàn thành
                                        </option>
                                        <option value='canceled'>Hủy bỏ</option>
                                        <option value='overdue'>Quá hạn</option>
                                    </select>
                                </div>
                                {/* todo */}
                                {todos && (
                                    <div className={styles.Field}>
                                        <label>Danh mục</label>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                gap: 10,
                                            }}
                                        >
                                            <select
                                                name='todo'
                                                value={formData.todo}
                                                onChange={handleChange}
                                                required
                                            >
                                                {todos.map((todo, i) => (
                                                    <option
                                                        key={i}
                                                        value={todo._id}
                                                    >
                                                        {todo.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div
                                                className={styles.IconButton}
                                                onClick={() =>
                                                    setOpenTodoModal(true)
                                                }
                                            >
                                                <MuiIcons.Add />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* due date */}
                                <div className={styles.Field}>
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type='date'
                                        name='dueDate'
                                        value={
                                            formData.dueDate?.slice(0, 10) || ""
                                        }
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {/* end date */}
                                <div className={styles.Field}>
                                    <label>Ngày hoàn tất</label>
                                    <input
                                        type='date'
                                        name='endDate'
                                        value={
                                            formData.endDate?.slice(0, 10) || ""
                                        }
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.Field}>
                                    <label>Lặp lại</label>
                                    <select
                                        name='repeat'
                                        value={formData.repeat}
                                        onChange={handleChange}
                                    >
                                        <option value='none'>Không</option>
                                        <option value='daily'>Hàng ngày</option>
                                        <option value='weekly'>
                                            Hàng tuần
                                        </option>
                                        <option value='monthly'>
                                            Hàng tháng
                                        </option>
                                        <option value='yearly'>Hàng năm</option>
                                    </select>
                                </div>
                                <div className={styles.Field}>
                                    <label>Ưu tiên</label>
                                    <select
                                        name='priority'
                                        value={formData.priority}
                                        onChange={handleChange}
                                    >
                                        <option value={"low"}>Thấp</option>
                                        <option value={"medium"}>
                                            Trung bình
                                        </option>
                                        <option value={"high"}>Cao</option>
                                        <option value={"urgent"}>
                                            Khẩn cấp
                                        </option>
                                    </select>
                                </div>

                                <div className={styles.Buttons}>
                                    <button
                                        type='submit'
                                        className={styles.button}
                                    >
                                        Xác nhận
                                    </button>
                                    {formData._id !== "" && (
                                        <button
                                            type='button'
                                            className={styles.button}
                                            style={{
                                                marginLeft: 15,
                                                backgroundColor: "#ef4444",
                                            }}
                                            onClick={(e) => handleDelete(e)}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </>
                {/* Todo modal */}
                <>
                    {openTodoModal && (
                        <div
                            className={`${styles.overlay}`}
                            onClick={() => setOpenTodoModal(false)}
                        />
                    )}
                    <div
                        className={`${styles.ModalTodo} ${
                            openTodoModal ? styles.open : ""
                        }`}
                    >
                        {selectTodo && (
                            <div className={styles.TodoModalHeader}>
                                <input
                                    className={styles.todoName}
                                    value={selectTodo.name}
                                    onChange={handleSelectTodoName}
                                    onBlur={handleSaveTodoName}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSaveTodoName();
                                            e.target.blur();
                                        }
                                    }}
                                    required
                                />
                                <Tooltip title='Xóa'>
                                    <MuiIcons.DeleteForeverOutlined
                                        onClick={(e) => handleDeleteTodo(e)}
                                    />
                                </Tooltip>
                            </div>
                        )}
                        <h3>Danh sách danh mục</h3>
                        <div className={styles.TodoItems}>
                            {todos &&
                                todos.map((todo, index) => (
                                    <div
                                        key={index}
                                        className={styles.TodoItem}
                                        onClick={() => setSelectTodo(todo)}
                                    >
                                        {todo.name}
                                    </div>
                                ))}
                        </div>
                        {/* Tạo mới danh mục */}
                        <h3
                            className={styles.addText}
                            style={{
                                textAlign: "center",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                            onClick={handleAddTodo}
                        >
                            + Danh mục
                        </h3>
                    </div>
                </>
            </div>
        </div>
    );
};

export default CalendarPage;
