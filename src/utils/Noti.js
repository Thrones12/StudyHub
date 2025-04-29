import Swal from "sweetalert2";

const success = (text) => {
    Swal.fire({
        title: "Thành công!",
        text: text,
        icon: "success", // Các tùy chọn icon: "success", "error", "warning", "info", "question"
        showConfirmButton: false,
        timer: 1500,
    });
};

const error = (text) => {
    Swal.fire({
        title: "Thất bại!",
        text: text,
        icon: "error", // Các tùy chọn icon: "success", "error", "warning", "info", "question"
        showConfirmButton: false,
        timer: 2500,
    });
};

const info = (text) => {
    Swal.fire({
        title: "Thông báo!",
        text: text,
        icon: "info", // Các tùy chọn icon: "success", "error", "warning", "info", "question"
        confirmButtonText: "Đã biết!",
    });
};

const infoWithDirection = ({ text, confirmText, func }) => {
    Swal.fire({
        title: "Thông báo!",
        text: text,
        icon: "info", // Các tùy chọn icon: "success", "error", "warning", "info", "question"
        confirmButtonText: confirmText ? confirmText : "Xác nhận",
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            func();
        }
    });
};

const infoWithYesNo = ({ title, text, confirmText, func }) => {
    Swal.fire({
        title: title ? title : "Thông báo!",
        html: text, // dùng html thay vì text
        icon: "info",
        confirmButtonText: confirmText ? confirmText : "Xác nhận",
        cancelButtonText: "Hủy",
        showCancelButton: true,
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            func();
        }
    });
};

const Noti = { success, error, info, infoWithDirection, infoWithYesNo };

export default Noti;
