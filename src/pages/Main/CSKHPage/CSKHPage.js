import React, { useState } from "react";
import { MainLayoutHeader } from "../../../components";
import * as MuiIcons from "@mui/icons-material";
import styles from "./CSKHPage.module.scss";
import { useNavigate } from "react-router-dom";
import { Support } from "../../../services";
import useFetch from "../../../hooks/useFetch";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Noti from "../../../utils/Noti";

const CSKHPage = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const toggleFAQ = (index) => {
        setOpenIndex(index === openIndex ? null : index);
    };
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        title: "",
        question: "",
    });
    // Lấy dữ liệu support
    const { data: supports, refetch } = useFetch({
        url: `http://localhost:8080/api/support/show`,
        method: "GET",
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await Support.Create(formData);
        if (res === true) {
            Noti.success("Gửi thành công");
            setFormData({
                name: "",
                email: "",
                title: "",
                question: "",
            });
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
                                    <Accordion key={index}>
                                        <AccordionSummary
                                            expandIcon={<MuiIcons.ExpandMore />}
                                            aria-controls='panel1-content'
                                            id='panel1-header'
                                            sx={{
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
                                <a
                                    href='https://www.facebook.com/profile.php?id=61560673299548'
                                    target='_blank'
                                    className={styles.Social}
                                >
                                    <MuiIcons.Facebook />
                                </a>
                                <a
                                    href='https://www.instagram.com/_phamphong/'
                                    target='_blank'
                                    className={styles.Social}
                                >
                                    <MuiIcons.Instagram />
                                </a>
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
