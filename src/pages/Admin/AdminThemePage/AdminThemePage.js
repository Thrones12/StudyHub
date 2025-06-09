import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminThemePage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import { Avatar, Button, CircularProgress } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { normalize } from "../../../utils/Helpers";
import axios from "axios";
import Noti from "../../../utils/Noti";

const AdminThemePage = () => {
    // Lấy dữ liệu người dùng
    const {
        data: themes,
        loading,
        refetch,
    } = useFetch({
        url: `http://localhost:8080/api/theme`,
        method: "GET",
    });
    const [processedThemes, setProcessedThemes] = useState([]);
    useEffect(() => {
        if (!themes || themes.length === 0) return;

        setProcessedThemes(themes);
    }, [themes]);
    // PHÂN TRANG
    const [filteredThemes, setFilteredThemes] = useState([]);
    const [paginatedThemes, setPaginatedThemes] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredThemes.length / itemsPerPage);

    useEffect(() => {
        setFilteredThemes(processedThemes);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(processedThemes.length / itemsPerPage);
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedThemes(processedThemes.slice(startIndex, endIndex));
    }, [processedThemes]);
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedThemes(filteredThemes.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredThemes]);

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
        { label: "Hình ảnh", value: "image" },
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!themes || themes.length === 0) return;

        // Lọc
        let filtered = [...themes];

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
            case "image":
                filtered.sort((a, b) => b.images.length - a.images.length);
                break;
            default:
                break;
        }

        setProcessedThemes(filtered);
    }, [themes, sortValue]);

    // TÌM KIẾM
    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredThemes(processedThemes);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredThemes(
            processedThemes.filter((theme) => {
                const name = normalize(theme?.name) || "";
                const icon = normalize(theme?.icon) || "";

                const combined = `${name} ${icon}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedThemes]);

    // MODAL
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        name: "",
        icon: "",
        images: "",
    });
    const onAdd = () => {
        setFormData({
            _id: "",
            name: "",
            icon: "",
            images: "",
        });
        setShowModal(true);
    };
    const onEdit = (theme) => {
        const imagesString = (theme.images || []).join("\n");
        setFormData({
            ...theme,
            images: imagesString,
        });
        setShowModal(true);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const processedImages = formData.images
            .split("\n")
            .map((img) => img.trim())
            .filter(Boolean); // loại bỏ dòng trống
        // Tạo mới
        if (formData._id == "") {
            await axios.post(`http://localhost:8080/api/theme`, {
                name: formData.name,
                icon: formData.icon,
                images: processedImages,
            });
            Noti.success("Tạo mới thành công");
        }
        // Cập nhập
        else {
            await axios.put(`http://localhost:8080/api/theme/${formData._id}`, {
                ...formData,
                images: processedImages,
            });
            Noti.success("Cập nhập thành công");
        }
        refetch();
        setFormData({
            _id: "",
            name: "",
            icon: "",
            images: "",
        });

        setShowModal(false);
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/theme/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                name: "",
                icon: "",
                images: "",
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
                                <th>Tên theme</th>
                                <th>Tên icon {`Mui icon`}</th>
                                <th>Số lượng hình ảnh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedThemes && paginatedThemes.length > 0 ? (
                                paginatedThemes.map((theme, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => onEdit(theme)}
                                        >
                                            <td>{theme.name}</td>
                                            <td>{theme.icon}</td>
                                            <td>{theme.images.length} hình</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>Không có theme nào.</td>
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
                                placeholder='Tên theme'
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
                            <textarea
                                name='images'
                                placeholder='Hình ảnh'
                                style={{ resize: "vertical" }}
                                value={formData.images}
                                onChange={handleChange}
                                rows='10'
                            />
                        </div>
                        <p style={{ marginTop: -10 }}>
                            * Hình ảnh ngăn cách nhau bằng cách xuống dòng.
                        </p>
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

export default AdminThemePage;
