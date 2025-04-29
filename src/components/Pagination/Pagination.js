import React from "react";
import "./Pagination.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ page, setPage, total }) => {
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= total) {
            setPage(newPage);
        }
    };
    // Tính toán số trang cần hiển thị
    const getPaginationRange = () => {
        const range = [];
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(total, page + 2);
        console.log(total);

        for (let i = startPage; i <= endPage; i++) {
            range.push(i);
        }

        return range;
    };
    return (
        <div className='pagination'>
            {/* Nút Previous */}
            <button
                className={`icon ${page === 1 ? "disable" : ""}`}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {/* Hiển thị các số trang */}
            {getPaginationRange().map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`number ${pageNumber === page ? "active" : ""}`}
                >
                    {pageNumber}
                </button>
            ))}

            {/* Nút Next */}
            <button
                className={`icon ${page === total ? "disable" : ""}`}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === total}
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    );
};

export default Pagination;
