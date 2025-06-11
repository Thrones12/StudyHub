import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./AdminSupportPage.module.scss";
import { AdminLayoutHeader, AdminLayoutTools } from "../../../components";
import useFetch from "../../../hooks/useFetch";
import { Avatar, Button, CircularProgress } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { normalize } from "../../../utils/Helpers";
import axios from "axios";
import Noti from "../../../utils/Noti";

const AdminSupportPage = () => {
    // Lấy dữ liệu người dùng
    const { data: supports, refetch } = useFetch({
        url: `http://localhost:8080/api/support`,
        method: "GET",
    });
    const [processedSupports, setProcessedSupports] = useState([]);
    useEffect(() => {
        if (!supports || supports.length === 0) return;

        setProcessedSupports(processedSupports);
    }, [supports]);
    // PHÂN TRANG
    const [filteredSupports, setFilteredSupports] = useState([]);
    const [paginatedSupports, setPaginatedSupports] = useState([]);
    const [page, setPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState("1");
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredSupports.length / itemsPerPage);

    useEffect(() => {
        setFilteredSupports(processedSupports);

        // Nếu trang hiện tại lớn hơn tổng số trang mới, reset về trang 1
        const newTotalPages = Math.ceil(
            processedSupports.length / itemsPerPage
        );
        const newPage = page > newTotalPages ? 1 : page;
        setPage(newPage);
        setGotoPageInput(String(newPage));

        // Tính lại dữ liệu phân trang
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = newPage * itemsPerPage;
        setPaginatedSupports(processedSupports.slice(startIndex, endIndex));
    }, [processedSupports]);
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        setPaginatedSupports(filteredSupports.slice(startIndex, endIndex));
        setGotoPageInput(String(page));
    }, [page, filteredSupports]);

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
            title: "Trạng thái",
            options: [
                { label: "Đã trả lời", value: "has_answered" },
                { label: "Chưa trả lời", value: "not_answered" },
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
    ];
    const [sortValue, setSortValue] = useState("newest");
    // Trigger sort
    const onSort = (sortValue) => {
        setSortValue(sortValue);
    };
    // Xử lý filter và sort
    useEffect(() => {
        if (!supports || supports.length === 0) return;

        // Hàm tách filterValue thành object { gender: [...], status: [...] }
        const splitFilterValues = (filterValues) => {
            const statusOptions = filters[0].options.map((opt) => opt.value);

            return {
                status: filterValues.filter((val) =>
                    statusOptions.includes(val)
                ),
            };
        };

        const { status } = splitFilterValues(filterValue);

        // Lọc
        let filtered = [...supports];

        // Lọc theo status (nếu có)
        if (status.length > 0) {
            filtered = filtered.filter((item) => {
                const hasAnswered = !!item.answer?.trim(); // true nếu có câu trả lời (không rỗng, không chỉ khoảng trắng)

                if (status.includes("has_answered") && hasAnswered) return true;
                if (status.includes("not_answered") && !hasAnswered)
                    return true;

                return false;
            });
        }
        // Sắp xếp
        switch (sortValue) {
            case "newest":
                filtered.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
            case "alphabet":
                filtered.sort((a, b) =>
                    a.title.localeCompare(b.title, "vi", {
                        sensitivity: "base",
                    })
                );
                break;
            default:
                break;
        }

        setProcessedSupports(filtered);
    }, [supports, sortValue, filterValue]);

    // TÌM KIẾM
    const [searchText, setSearchText] = useState("");
    const onSearch = (text) => {
        setSearchText(text);
    };

    useEffect(() => {
        if (!searchText) {
            setFilteredSupports(processedSupports);
            return;
        }

        const normalizedSearch = normalize(searchText);

        setFilteredSupports(
            processedSupports.filter((support) => {
                const title = normalize(support?.title) || "";
                const name = normalize(support?.name) || "";
                const email = normalize(support?.email) || "";
                const question = normalize(support?.question) || "";

                const combined = `${title} ${name} ${email} ${question}`;

                const keywords = normalizedSearch.split(" ").filter(Boolean); // bỏ khoảng trắng thừa
                return keywords.every((kw) => combined.includes(kw));
            })
        );
    }, [searchText, processedSupports]);

    // EDIT
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        document.body.style.cursor = loading ? "wait" : "default";
        return () => {
            document.body.style.cursor = "default";
        };
    }, [loading]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        _id: "",
        name: "",
        email: "",
        title: "",
        question: "",
        answer: "",
    });

    const onEdit = (support) => {
        setFormData({ ...support });
        setShowModal(true);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `http://localhost:8080/api/support/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                name: "",
                email: "",
                title: "",
                question: "",
                answer: "",
            });
            Noti.success("Trả lời thành công");
            setShowModal(false);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (e) => {
        e.preventDefault();
        const onDelete = async () => {
            await axios.delete(
                `http://localhost:8080/api/support/${formData._id}`,
                formData
            );
            refetch();
            setFormData({
                _id: "",
                name: "",
                email: "",
                title: "",
                question: "",
                answer: "",
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
            <AdminLayoutHeader openModalAdd={() => setShowModal(true)} />
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
                                <th style={{ width: 400 }}>Tiêu đề</th>
                                <th style={{ width: 600 }}>Nội dung</th>
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSupports &&
                            paginatedSupports.length > 0 ? (
                                paginatedSupports.map((support, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => onEdit(support)}
                                        >
                                            <td>{support.title}</td>
                                            <td>{support.question}</td>
                                            <td>{support.name}</td>
                                            <td>{support.email}</td>
                                            <td>
                                                {support?.answer !== ""
                                                    ? "Đã trả lời"
                                                    : ""}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5}>Không có câu hỏi nào.</td>
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
                                placeholder='Họ tên'
                                style={{ backgroundColor: "#d3d3d3" }}
                                value={formData.name}
                                disabled
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='email'
                                name='email'
                                placeholder='Email'
                                style={{ backgroundColor: "#d3d3d3" }}
                                value={formData.email}
                                disabled
                            />
                        </div>
                        <div className={styles.Field}>
                            <input
                                type='text'
                                name='title'
                                placeholder='Tiêu đề'
                                style={{ backgroundColor: "#d3d3d3" }}
                                value={formData.title}
                                disabled
                            />
                        </div>
                        <div className={styles.Field}>
                            <textarea
                                name='question'
                                placeholder='Nội dung cần hỗ trợ'
                                style={{
                                    backgroundColor: "#d3d3d3",
                                    resize: "vertical",
                                }}
                                value={formData.question}
                                rows='5'
                                disabled
                            ></textarea>
                        </div>
                        <div className={styles.Field}>
                            <textarea
                                name='answer'
                                placeholder='Câu trả lời'
                                value={formData.answer}
                                rows='5'
                                style={{ resize: "vertical" }}
                                onChange={handleChange}
                                required
                            ></textarea>
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

export default AdminSupportPage;
