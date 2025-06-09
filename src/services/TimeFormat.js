import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/vi";
dayjs.extend(duration);

const SecondToMinute = (seconds) => {
    const minutes = Math.round(seconds / 60); // dùng round để làm tròn
    return `${minutes} phút`;
};

const convertToHourAndMinute = (seconds) => {
    if (!seconds || seconds < 0) return "0 phút";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = "";
    if (hours > 0) result += `${hours} giờ `;
    if (minutes > 0 || hours === 0) result += `${minutes} phút`;

    return result.trim();
};

function TimeAgo(inputDate) {
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

function isOlderThanOneHour(createdAt) {
    const currentTime = new Date();
    const createdTime = new Date(createdAt);

    // Tính toán chênh lệch thời gian giữa hiện tại và createdAt (tính bằng phút)
    const timeDifferenceInMinutes = (currentTime - createdTime) / (1000 * 60); // chuyển từ milliseconds sang phút

    // Kiểm tra nếu chênh lệch thời gian lớn hơn 60 phút
    return timeDifferenceInMinutes > 60;
}

function getMonthYear(date = dayjs()) {
    const month = date.month() + 1; // month() trả về 0-11
    const year = date.year();
    return `Tháng ${month}, ${year}`;
}
function formatDateTime(dateInput) {
    const date = new Date(dateInput);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng tính từ 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
}
function getTimeRemaining(targetDate) {
    const now = dayjs();
    const diffInMs = targetDate.diff(now);

    if (diffInMs <= 0) return "0m";

    const dur = dayjs.duration(diffInMs);

    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();

    return `${days}d ${hours}h ${minutes}m`;
}
const isToday = (date) => {
    if (!date) return false;
    return dayjs(date).isSame(dayjs(), "day");
};
function isOverdue(date) {
    if (!date) return false;
    const inputDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");
    return inputDate.isBefore(today);
}
const TimeFormat = {
    SecondToMinute,
    TimeAgo,
    isOlderThanOneHour,
    getMonthYear,
    convertToHourAndMinute,
    formatDateTime,
    getTimeRemaining,
    isToday,
    isOverdue,
};

export { TimeFormat };
