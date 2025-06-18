import React, { useState } from "react";
import { MainLayoutHeader } from "../../../components";
import * as MuiIcons from "@mui/icons-material";
import styles from "./CSKHPage.module.scss";
import { useNavigate } from "react-router-dom";
import { Support } from "../../../services";
import useFetch from "../../../hooks/useFetch";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Tooltip,
} from "@mui/material";
import Noti from "../../../utils/Noti";

const CSKHPage = () => {
    // Sử dụng useNavigate để điều hướng
    const navigate = useNavigate();
    // State để quản lý trạng thái của accordion
    const [openIndex, setOpenIndex] = useState(null);
    // State để quản lý dữ liệu biểu mẫu hỗ trợ
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        title: "",
        question: "",
    });
    // Lấy dữ liệu support
    const { data: supports } = useFetch({
        url: `http://localhost:8080/api/support/show`,
        method: "GET",
    });
    // Hàm xử lý khi người dùng click vào một câu hỏi
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    // Hàm xử lý khi người dùng gửi biểu mẫu hỗ trợ
    // Gửi dữ liệu biểu mẫu đến API và reset lại form nếu thành công
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Kiểm tra xem tất cả các trường đã được điền đầy đủ chưa
            if (
                !formData.name ||
                !formData.email ||
                !formData.title ||
                !formData.question
            ) {
                Noti.error("Vui lòng điền đầy đủ thông tin.");
                return;
            }
            // Kiểm tra định dạng email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(formData.email)) {
                Noti.error("Email không hợp lệ.");
                return;
            }
            // Kiểm tra độ dài tiêu đề và nội dung câu hỏi
            if (formData.title.length < 5 || formData.question.length < 10) {
                Noti.error(
                    "Tiêu đề phải có ít nhất 5 ký tự và nội dung câu hỏi phải có ít nhất 10 ký tự."
                );
                return;
            }
            // Nếu tất cả các trường hợp trên đều hợp lệ, gửi yêu cầu hỗ trợ
            // Đặt con trỏ chuột thành đợi để tránh gửi nhiều yêu cầu cùng lúc
            document.body.style.cursor = "wait";
            // Gọi API để gửi yêu cầu hỗ trợ
            const res = await Support.Create(formData);
            // Kiểm tra kết quả trả về từ API
            if (res === true) {
                Noti.success("Gửi yêu cầu hỗ trợ thành công.");
            }
            // Reset lại form sau khi gửi thành công
            setFormData({
                name: "",
                email: "",
                title: "",
                question: "",
            });
        } catch (error) {
            Noti.error("Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ.");
        } finally {
            // Đặt con trỏ chuột trở lại trạng thái bình thường
            // Điều này sẽ giúp người dùng biết rằng yêu cầu đã được gửi thành công hoặc thất bại
            // và họ có thể tiếp tục sử dụng trang web mà không gặp rắc rối
            document.body.style.cursor = "default";
        }
    };
    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <MainLayoutHeader />
            {/* Content */}
            <div className={styles.container}>
                <div className='row'>
                    <div className='col-6'>
                        <div className={styles.Title}>FAQ</div>
                        <div className={styles.FAQ}>
                            {supports &&
                                supports.map((support, index) => (
                                    <Accordion
                                        key={index}
                                        sx={{
                                            mb: 2,
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<MuiIcons.ExpandMore />}
                                            aria-controls='panel1-content'
                                            id='panel1-header'
                                            sx={{
                                                "&.MuiAccordionSummary-root": {
                                                    borderRadius: "8px",
                                                },
                                                "&.Mui-expanded": {
                                                    minHeight: "48px",
                                                },
                                                ".MuiAccordionSummary-content":
                                                    {
                                                        "&.Mui-expanded": {
                                                            margin: "12px 0",
                                                        },
                                                    },
                                            }}
                                        >
                                            <p className={styles.Question}>
                                                {support.question}
                                            </p>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <p className={styles.Answer}>
                                                {support.answer}
                                            </p>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                        </div>
                    </div>
                    <div className='col-6'>
                        {/* Thông tin */}
                        <div className={styles.Contacts}>
                            <div className={styles.Title}>Liên hệ</div>
                            {/* Địa chỉ */}
                            <div className={styles.Contact}>
                                <MuiIcons.LocationOnOutlined />
                                <p>
                                    01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, Hồ
                                    Chí Minh, Việt Nam
                                </p>
                            </div>
                            {/* Email */}
                            <div className={styles.Contact}>
                                <MuiIcons.EmailOutlined />
                                <p>21110273@student.hcmute.edu.vn</p>
                            </div>
                            {/* Điện thoại */}
                            <div className={styles.Contact}>
                                <MuiIcons.CallOutlined />
                                <p>+84 981 141 044</p>
                            </div>

                            {/* Mạng xã hội */}
                            <div className={styles.Socials}>
                                <Tooltip title='Facebook'>
                                    <a
                                        href='https://www.facebook.com/profile.php?id=61560673299548'
                                        target='_blank'
                                        className={styles.Social}
                                    >
                                        <MuiIcons.Facebook />
                                    </a>
                                </Tooltip>
                                <Tooltip title='Instagram'>
                                    <a
                                        href='https://www.instagram.com/hoangminh_21110273/'
                                        target='_blank'
                                        className={styles.Social}
                                    >
                                        <MuiIcons.Instagram />
                                    </a>
                                </Tooltip>
                            </div>
                        </div>
                        {/* Support form */}
                        <div className={styles.SupportForm}>
                            <div className={styles.Title}>Biểu mẫu</div>
                            <form
                                onSubmit={handleSubmit}
                                className={styles.Form}
                            >
                                <div className='row'>
                                    <div className={styles.ColLeft}>
                                        <div className={styles.Field}>
                                            <input
                                                type='text'
                                                name='name'
                                                placeholder='Họ tên'
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.ColRight}>
                                        <div className={styles.Field}>
                                            <input
                                                type='email'
                                                name='email'
                                                placeholder='Email'
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.Field}>
                                    <input
                                        type='text'
                                        name='title'
                                        placeholder='Tiêu đề'
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.Field}>
                                    <textarea
                                        name='question'
                                        placeholder='Nội dung cần hỗ trợ'
                                        value={formData.question}
                                        onChange={handleChange}
                                        rows='5'
                                        required
                                    ></textarea>
                                </div>
                                <div className={styles.Button}>
                                    <button
                                        type='submit'
                                        className={styles.button}
                                    >
                                        Gửi yêu cầu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CSKHPage;
