import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminUserPage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import {
    Avatar,
    Button,
    CircularProgress,
    FormControlLabel,
    Radio,
    RadioGroup,
    Tooltip,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { normalize } from "../../../utils/Helpers";
import Noti from "../../../utils/Noti";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const AdminUserPage = () => {
    const nav = useNavigate();
    // Lấy dữ liệu người dùng
    const {
        data: users,
        loading,
        refetch,
    } = useFetch({
        url: `http://localhost:8080/api/user`,
        method: "GET",
    });
    const [processedUsers, setProcessedUsers] = useState([]);
    useEffect(() => {
        if (!users || users.length === 0) return;

        const calculatedUsers = users.map((user) => {
            let doneLessons =
                user.learned?.reduce((total, course) => {
                    return (
                        total +
                        course.subjects.reduce((subjectTotal, subject) => {
                            return (
                                subjectTotal +
                                subject.lessons.filter(
                                    (lesson) => lesson.isDone
                                ).length
                            );
                        }, 0)
                    );
                }, 0) || 0;

            let totalSeconds =
                (user.learningHour?.reduce((total, session) => {
                    return (
                        total +
                        session.courses.reduce((courseTotal, course) => {
                            return (
                                courseTotal +
                                course.subjects.reduce(
                                    (subjectTotal, subject) => {
                                        return (
                                            subjectTotal + (subject.second || 0)
                                        );
                                    },
                                    0
                                )
                            );
                        }, 0)
                    );
                }, 0) || 0) +
                (user.sessions?.reduce((sessionTotal, session) => {
                    return sessionTotal + (session.spentTime || 0) * 60;
                }, 0) || 0);

            const totalHours = totalSeconds / 3600; // ví dụ: "3.25" giờ
            const totalExams = user.examResults?.length || 0;

            return {
                ...user,
                stats: {
                    totalHours,
                    doneLessons,
                    totalExams,
                },
            };
        });

        setProcessedUsers(calculatedUsers);
    }, [users]);
    // PHÂN TRANG
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [paginatedUsers, setPaginatedUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => {
        // Lọc bỏ admin mỗi khi processedUsers thay đổi
        const newFilteredUsers =
            processedUsers?.filter((user) => user.role !== "admin") || [];

        setFilteredUsers(newFilteredUsers);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(newFilteredUsers.length / itemsPerPage);
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedUsers(newFilteredUsers.slice(startIndex, endIndex));
    }, [processedUsers]);
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredUsers]);

    // Khi nhấn Enter hoặc click nút
    const handleGotoPage = () => {
        const pageNumber = parseInt(gotoPageInput);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
            setGotoPageInput(pageNumber.toFixed(0));
        }
    };
    // LỌC
    const [filters, setFilters] = useState([
        {
            title: "Giới tính",
            options: [
                { label: "Nam", value: "Male" },
                { label: "Nữ", value: "Female" },
                { label: "Khác", value: "Other" },
            ],
        },
        {
            title: "Trạng thái",
            options: [
                { label: "Hoạt động", value: "active" },
                { label: "Đã khóa", value: "locked" },
                { label: "Chưa xác thực", value: "not_verify" },
            ],
        },
    ]);
    const [filterValue, setFilterValue] = useState([]);
    // Trigger filter
    const onFilter = (filterValue) => {
        setFilterValue(filterValue);
    };
    // SẮP XẾP
    const sortBy = [
        { label: "Mới nhất", value: "newest" },
        { label: "A-Z", value: "alphabet" },
        { label: "Giờ học", value: "hour" },
        { label: "Bài học", value: "lesson" },
        { label: "Kiểm tra", value: "exam" },
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!users || users.length === 0) return;

        const calculatedUsers = users.map((user) => {
            let doneLessons =
                user.learned?.reduce((total, course) => {
                    return (
                        total +
                        course.subjects.reduce((subjectTotal, subject) => {
                            return (
                                subjectTotal +
                                subject.lessons.filter(
                                    (lesson) => lesson.isDone
                                ).length
                            );
                        }, 0)
                    );
                }, 0) || 0;

            let totalSeconds =
                (user.learningHour?.reduce((total, session) => {
                    return (
                        total +
                        session.courses.reduce((courseTotal, course) => {
                            return (
                                courseTotal +
                                course.subjects.reduce(
                                    (subjectTotal, subject) => {
                                        return (
                                            subjectTotal + (subject.second || 0)
                                        );
                                    },
                                    0
                                )
                            );
                        }, 0)
                    );
                }, 0) || 0) +
                (user.sessions?.reduce((sessionTotal, session) => {
                    return sessionTotal + (session.spentTime || 0) * 60;
                }, 0) || 0);

            const totalHours = totalSeconds / 3600;
            const totalExams = user.examResults?.length || 0;

            return {
                ...user,
                stats: {
                    totalHours,
                    doneLessons,
                    totalExams,
                },
            };
        });

        // Hàm tách filterValue thành object { gender: [...], status: [...] }
        const splitFilterValues = (filterValues) => {
            const genderOptions = filters[0].options.map((opt) => opt.value);
            const statusOptions = filters[1].options.map((opt) => opt.value);

            return {
                gender: filterValues.filter((val) =>
                    genderOptions.includes(val)
                ),
                status: filterValues.filter((val) =>
                    statusOptions.includes(val)
                ),
            };
        };

        const { gender, status } = splitFilterValues(filterValue);

        // Lọc bỏ admin
        let filtered = calculatedUsers.filter((user) => user.role !== "admin");

        // Lọc theo gender (nếu có)
        if (gender.length > 0) {
            filtered = filtered.filter((user) =>
                gender.includes(user.profile.gender)
            );
        }
        // Lọc theo status (nếu có)
        if (status.length > 0) {
            filtered = filtered.filter((user) => status.includes(user.status));
        }
        // Sắp xếp
        switch (sortValue) {
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) =>
                    a.username.localeCompare(b.username, "vi", {
                        sensitivity: "base",
                    })
                );
                break;
            case "hour":
                filtered.sort(
                    (a, b) =>
                        (b.stats.totalHours || 0) - (a.stats.totalHours || 0)
                );
                break;
            case "lesson":
                filtered.sort(
                    (a, b) =>
                        (b.stats.doneLessons || 0) - (a.stats.doneLessons || 0)
                );
                break;
            case "exam":
                filtered.sort(
                    (a, b) =>
                        (b.stats.totalExams || 0) - (a.stats.totalExams || 0)
                );
                break;
            default:
                break;
        }

        setProcessedUsers(filtered);
    }, [users, sortValue, filterValue]);

    // TÌM KIẾM
    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredUsers(processedUsers);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredUsers(
            processedUsers.filter((user) => {
                const username = normalize(user?.username) || "";
                const email = normalize(user?.email) || "";
                const fullname = normalize(user?.profile?.fullname) || "";

                const combined = `${username} ${email} ${fullname}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedUsers]);

    // MODAL
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        _id: "",
        username: "",
        email: "",
        password: "",
        status: "active",
        avatar: "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749332122/user-286_kf2bvt.png",
        fullname: "",
        gender: "Male",
        address: "",
        phone: "",
        birthdate: new Date().toISOString().slice(0, 10),
        school: "",
        grade: "",
        hobby: "",
        interests: "",
    });
    // Xử lý thay đổi avatar
    const handleFileChange = (e) => {
        const newFile = e.target.files[0];
        if (newFile) {
            setFile(newFile);
            setFormData({ ...formData, avatar: URL.createObjectURL(newFile) });
        }
    };
    const onAdd = () => {
        setFormData({
            _id: "",
            username: "",
            email: "",
            password: "",
            status: "active",
            avatar: "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749332122/user-286_kf2bvt.png",
            fullname: "",
            gender: "Male",
            address: "",
            phone: "",
            birthdate: new Date().toISOString().slice(0, 10),
            school: "",
            grade: "",
            hobby: "",
            interests: "",
        });
        setShowModal(true);
    };
    const onEdit = (user) => {
        setFormData({
            _id: user._id,
            username: user.username,
            email: user.email,
            password: user.password,
            status: user.status,
            avatar:
                user.profile.avatarUrl ??
                "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749332122/user-286_kf2bvt.png",
            fullname: user.profile.fullname,
            gender: user.profile.gender,
            birthdate: user.profile.birthdate
                ? user.profile.birthdate.slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            address: user.profile.address,
            phone: user.profile.phone,
            school: user.profile.school,
            grade: user.profile.grade,
            hobby: user.profile.hobby,
            interests: user.profile.interests,
        });
        setShowModal(true);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("username", formData.username);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("status", formData.status);
        data.append("fullname", formData.fullname);
        data.append("gender", formData.gender);
        data.append("address", formData.address);
        data.append("phone", formData.phone);
        data.append("birthdate", formData.birthdate);
        data.append("school", formData.school);
        data.append("grade", formData.grade);
        data.append("hobby", formData.hobby);
        data.append("interests", formData.interests);
        if (file) data.append("image", file);

        document.body.style.cursor = "wait";
        // Tạo mới
        try {
            if (formData._id == "") {
                console.log(data);

                await axios.post(`http://localhost:8080/api/user`, data);
                Noti.success("Tạo mới thành công");
            }
            // Cập nhập
            else {
                data.append("_id", formData._id);
                await axios.put(`http://localhost:8080/api/user`, data);
                Noti.success("Cập nhập thành công");
            }
        } catch (err) {
            Noti.error(`Lỗi: ${err.response.data}`);
        } finally {
            document.body.style.cursor = "default";
        }
        refetch();
        setFormData({
            _id: "",
            username: "",
            email: "",
            password: "",
            status: "",
            avatar: "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749332122/user-286_kf2bvt.png",
            fullname: "",
            gender: "Male",
            address: "",
            phone: "",
            birthdate: new Date().toISOString().slice(0, 10),
            school: "",
            grade: "",
            hobby: "",
            interests: "",
        });

        setShowModal(false);
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/user/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                username: "",
                email: "",
                password: "",
                status: "active",
                avatar: "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749332122/user-286_kf2bvt.png",
                fullname: "",
                gender: "Male",
                address: "",
                phone: "",
                birthdate: new Date().toISOString().slice(0, 10),
                school: "",
                grade: "",
                hobby: "",
                interests: "",
            });
            Noti.success("Xóa thành công");
            setShowModal(false);
        };
        Noti.infoWithYesNo({
            title: "Xóa",
            text: "Xác nhận xóa dữ liệu",
            func: () => onDelete(),
        });
    };
    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <AdminLayoutHeader hasAdd={true} openModalAdd={onAdd} />
            {/* Lọc và sắp xếp */}
            <AdminLayoutTools
                filters={filters}
                onFilter={onFilter}
                selectFilter={filterValue}
                sortBy={sortBy}
                onSort={onSort}
                selectSort={sortValue}
                searchText={searchText}
                onSearch={onSearch}
                sortWidth={"70px"}
            />
            {/* Nội dung */}
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>
                        <CircularProgress />
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Hình ảnh</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Họ tên</th>
                                <th>Giới tính</th>
                                <th>Điện thoại</th>
                                <th>Giờ học</th>
                                <th>Bài học</th>
                                <th>Bài kiểm tra</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers && paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => onEdit(user)}
                                        >
                                            <td>
                                                <Avatar
                                                    src={
                                                        user.profile
                                                            .avatarUrl || ""
                                                    }
                                                    alt={user.username}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                />
                                            </td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {user.profile.fullname ||
                                                    "Chưa cập nhật"}
                                            </td>
                                            <td>
                                                {user.profile.gender === "Male"
                                                    ? "Nam"
                                                    : user.profile.gender ===
                                                      "Female"
                                                    ? "Nữ"
                                                    : "Khác"}
                                            </td>
                                            <td>
                                                {user.profile.phone ||
                                                    "Chưa có"}
                                            </td>
                                            <td>{`${user.stats.totalHours.toFixed(
                                                2
                                            )} giờ`}</td>
                                            <td>{`${user.stats.doneLessons} bài`}</td>
                                            <td>{`${user.stats.totalExams} bài`}</td>
                                            <td>
                                                <span
                                                    className={
                                                        user.isBlocked
                                                            ? styles.blocked
                                                            : styles.active
                                                    }
                                                >
                                                    {user.status === "active"
                                                        ? "Hoạt động"
                                                        : user.status ===
                                                          "locked"
                                                        ? "Đã khóa"
                                                        : "Chưa xác thực"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        Không có người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Pagination Controls */}
            <div className={styles.pagination}>
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                        (p) =>
                            Math.abs(p - page) <= 2 ||
                            p === 1 ||
                            p === totalPages
                    )
                    .map((p, index, arr) => {
                        // Hiển thị dấu ...
                        if (index > 0 && p - arr[index - 1] > 1) {
                            return (
                                <span
                                    key={`ellipsis-${p}`}
                                    className={styles.ellipsis}
                                >
                                    ...
                                </span>
                            );
                        }
                        return (
                            <button
                                key={p}
                                className={p === page ? styles.activePage : ""}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        );
                    })}

                <button
                    onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                >
                    Sau
                </button>

                <div className={styles.gotoPage}>
                    <span>Đi đến:</span>
                    <input
                        type='number'
                        value={gotoPageInput}
                        onChange={(e) => setGotoPageInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleGotoPage();
                        }}
                        min={1}
                        max={totalPages}
                    />
                    <button onClick={handleGotoPage}>Đến</button>
                </div>
            </div>
            {/* Modal */}
            <div className={`${styles.Modal} ${showModal ? styles.open : ""}`}>
                <div className={styles.Header}>
                    <p></p>
                    <div
                        className={styles.button}
                        onClick={() => setShowModal(!showModal)}
                    >
                        <MuiIcons.Close />
                    </div>
                </div>
                <div className={styles.Body}>
                    <form onSubmit={handleSubmit} className={styles.Form}>
                        {/* image */}
                        <div className={styles.Image}>
                            <img
                                name='avatar'
                                src={formData.avatar}
                                alt='avatar'
                            />
                            <Tooltip title='Chỉnh sửa' placement='right'>
                                <label htmlFor='avatarUpload'>
                                    <FontAwesomeIcon icon={faPen} />
                                    <input
                                        id='avatarUpload'
                                        style={{
                                            display: "none",
                                        }}
                                        type='file'
                                        accept='image/*'
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </Tooltip>
                        </div>
                        <div className={styles.ImageText}>
                            Các loại tập tin được phép: png, jpg, jpeg
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='username'
                                placeholder='Tên đăng nhập'
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{
                                    backgroundColor:
                                        formData._id !== ""
                                            ? "#d3d3d3"
                                            : "#fff",
                                }}
                                disabled={formData._id !== ""}
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='email'
                                name='email'
                                placeholder='Địa chỉ email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    backgroundColor:
                                        formData._id !== ""
                                            ? "#d3d3d3"
                                            : "#fff",
                                }}
                                disabled={formData._id !== ""}
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='password'
                                name='password'
                                placeholder='Mật khẩu'
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* Status */}
                        <div className={styles.Field}>
                            <select
                                name='status'
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value='active'>Đang hoạt động</option>
                                <option value='locked'>Đã khóa</option>
                                <option value='not_verify'>
                                    Chưa xác minh
                                </option>
                            </select>
                        </div>
                        {/* Fullname */}
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='fullname'
                                placeholder='Họ tên'
                                value={formData.fullname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* Gender */}
                        <div className={styles.Field}>
                            <RadioGroup
                                row
                                aria-labelledby='demo-row-radio-buttons-group-label'
                                name='gender'
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value='Male'
                                    control={<Radio />}
                                    label='Nam'
                                />
                                <FormControlLabel
                                    value='Female'
                                    control={<Radio />}
                                    label='Nữ'
                                />
                                <FormControlLabel
                                    value='Other'
                                    control={<Radio />}
                                    label='Khác'
                                />
                            </RadioGroup>
                        </div>
                        {/* Address */}
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='address'
                                placeholder='Địa chỉ'
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Phone */}
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='phone'
                                placeholder='Điện thoại'
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Birthdate */}
                        <div className={styles.Field}>
                            <input
                                type='date'
                                name='birthdate'
                                placeholder='Ngày sinh'
                                value={formData.birthdate?.slice(0, 10) || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='school'
                                placeholder='Trường đang học'
                                value={formData.school}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='grade'
                                placeholder='Khối cấp'
                                value={formData.grade}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='hobby'
                                placeholder='Sở thích cá nhân'
                                value={formData.hobby}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='interests'
                                placeholder='Lĩnh vực quan tâm'
                                value={formData.interests}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.Buttons}>
                            <button type='submit' className={styles.button}>
                                Xác nhận
                            </button>
                            {formData._id !== "" && (
                                <button
                                    type='button'
                                    className={styles.button}
                                    style={{
                                        marginLeft: 15,
                                        backgroundColor: "#1b84ff",
                                    }}
                                    onClick={() =>
                                        nav(`/admin/user/${formData._id}`)
                                    }
                                >
                                    Chi tiết
                                </button>
                            )}

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
        </div>
    );
};

export default AdminUserPage;
