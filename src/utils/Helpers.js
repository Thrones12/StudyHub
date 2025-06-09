// Chuẩn hóa text thành tag
export const normalize = (str) => {
    if (!str) return "";

    return str
        .normalize("NFD") // tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, "") // loại bỏ dấu
        .replace(/đ/g, "d") // chuyển đ -> d
        .replace(/Đ/g, "d") // chuyển Đ -> d
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // loại bỏ ký tự đặc biệt
        .replace(/\s+/g, " ") // bỏ khoảng trắng thừa
        .trim();
};
// Định dạng để rút gọn số, ví dụ: 25000 -> 25N
export function formatViews(number) {
    if (typeof number !== "number") return number;

    if (number >= 1_000_000) {
        const millions = Math.floor(number / 1_000_000);
        const hundredThousands = Math.floor((number % 1_000_000) / 100_000);
        return `${millions}Tr${hundredThousands || ""}`;
    }

    if (number >= 1_000) {
        const thousands = Math.floor(number / 1_000);
        const hundreds = Math.floor((number % 1_000) / 100);
        return `${thousands}N${hundreds || ""}`;
    }

    return number.toString();
}
// Chuyển giây thành phút
export function formatDurationToMinute(duration) {
    const minutes = Math.round(duration / 60); // dùng round để làm tròn
    return `${minutes} phút`;
}
// Định dạng giây thành text hiển thị trong timer
export function formatTimer(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedMins = String(mins).padStart(2, "0");
    const paddedSecs = String(secs).padStart(2, "0");

    if (hrs > 0) {
        const paddedHrs = String(hrs).padStart(2, "0");
        return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
    } else {
        return `${paddedMins}:${paddedSecs}`;
    }
}
// Định dạng date thành text theo dạng: 28 tháng 5, 2025
export function formatDate(dateInput) {
    const date = new Date(dateInput);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng tính từ 0
    const year = date.getFullYear();

    return `${day} tháng ${month}, ${year}`;
}
// Định dạng datetime thành text theo dạng: 28 tháng 5, 2025 lúc 16:05
export function formatDateTime(dateInput) {
    const date = new Date(dateInput);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng tính từ 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
}
// Chuyển level trong exam thành tiếng Việt
export function formatExamLevel(level) {
    return level === "Easy"
        ? "Dễ"
        : level === "Medium"
        ? "Trung bình"
        : level === "Hard"
        ? "Khó "
        : "Cực khó";
}
// Chuyển level trong question thành tiếng Việt
export function formatQuestionLevel(level) {
    return level === "Easy"
        ? "Nhận biêt"
        : level === "Medium"
        ? "Thông hiểu"
        : level === "Hard"
        ? "Vận dụng"
        : "Vận dụng cao";
}
export function formatTimeAgo(inputDate) {
    const date = new Date(inputDate);
    const now = new Date();
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years >= 1) return `${years} năm trước`;
    if (months >= 1) return `${months} tháng trước`;
    if (weeks >= 1) return `${weeks} tuần trước`;
    if (days >= 1) return `${days} ngày trước`;
    if (hours >= 1) return `${hours} giờ trước`;
    if (minutes >= 1) return `${minutes} phút trước`;
    if (seconds >= 1) return `${seconds} phút trước`;
    return `Vừa xong`;
}
