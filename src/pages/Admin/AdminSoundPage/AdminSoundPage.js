import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminSoundPage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import { Avatar, Button, CircularProgress } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { normalize } from "../../../utils/Helpers";
import Noti from "../../../utils/Noti";
import axios from "axios";

const AdminSoundPage = () => {
    // Lấy dữ liệu người dùng
    const {
        data: sounds,
        loading,
        refetch,
    } = useFetch({
        url: `http://localhost:8080/api/sound`,
        method: "GET",
    });
    const [processedSounds, setProcessedSounds] = useState([]);

    useEffect(() => {
        if (!sounds || sounds.length === 0) return;

        setProcessedSounds(sounds);
    }, [sounds]);
    // PHÂN TRANG
    const [filteredSounds, setFilteredSounds] = useState([]);
    const [paginatedSounds, setPaginatedSounds] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredSounds.length / itemsPerPage);

    useEffect(() => {
        setFilteredSounds(processedSounds);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(processedSounds.length / itemsPerPage);
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedSounds(processedSounds.slice(startIndex, endIndex));
    }, [processedSounds]);
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedSounds(filteredSounds.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredSounds]);

    // Khi nhấn Enter hoặc click nút
    const handleGotoPage = () => {
        const pageNumber = parseInt(gotoPageInput);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
            setGotoPageInput(pageNumber.toFixed(0));
        }
    };
    // SẮP XẾP
    const sortBy = [
        { label: "Mới nhất", value: "newest" },
        { label: "A-Z", value: "alphabet" },
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!sounds || sounds.length === 0) return;

        // Lọc
        let filtered = [...sounds];

        // Sắp xếp
        switch (sortValue) {
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) =>
                    a.name.localeCompare(b.name, "vi", {
                        sensitivity: "base",
                    })
                );
                break;
            default:
                break;
        }

        setProcessedSounds(filtered);
    }, [sounds, sortValue]);

    // TÌM KIẾM
    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredSounds(processedSounds);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredSounds(
            processedSounds.filter((sound) => {
                const name = normalize(sound?.name) || "";
                const icon = normalize(sound?.icon) || "";
                const src = normalize(sound?.src) || "";

                const combined = `${name} ${icon} ${src}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedSounds]);

    // MODAL
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        name: "",
        icon: "",
        src: "",
    });
    const onAdd = () => {
        setFormData({
            _id: "",
            name: "",
            icon: "",
            src: "",
        });
        setShowModal(true);
    };
    const onEdit = (sound) => {
        setFormData({ ...sound });
        setShowModal(true);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Tạo mới
        if (formData._id == "") {
            await axios.post(`http://localhost:8080/api/sound`, {
                name: formData.name,
                icon: formData.icon,
                src: formData.src,
            });
            Noti.success("Tạo mới thành công");
        }
        // Cập nhập
        else {
            await axios.put(
                `http://localhost:8080/api/sound/${formData._id}`,
                formData
            );
            Noti.success("Cập nhập thành công");
        }
        refetch();
        setFormData({
            _id: "",
            name: "",
            icon: "",
            src: "",
        });

        setShowModal(false);
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/sound/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                name: "",
                icon: "",
                src: "",
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
                                <th>Tên âm thanh</th>
                                <th>Tên icon {`Mui icon`}</th>
                                <th>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSounds && paginatedSounds.length > 0 ? (
                                paginatedSounds.map((sound, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => onEdit(sound)}
                                        >
                                            <td>{sound.name}</td>
                                            <td>{sound.icon}</td>
                                            <td>{sound.src}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>Không có âm thanh nào.</td>
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
                    <div className={styles.button}>
                        <MuiIcons.Close
                            onClick={() => setShowModal(!showModal)}
                        />
                    </div>
                </div>
                <div className={styles.Body}>
                    <form onSubmit={handleSubmit} className={styles.Form}>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='name'
                                placeholder='Tên âm thanh'
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='icon'
                                placeholder='Tên icon (Mui icon)'
                                value={formData.icon}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='src'
                                placeholder='Tiêu đề'
                                value={formData.src}
                                onChange={handleChange}
                                required
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

export default AdminSoundPage;
