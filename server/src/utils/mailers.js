const nodemailer = require("nodemailer");

exports.sendMail = async ({ to, subject, html }) => {
    // Cấu hình Nodemailer
    const transporter = nodemailer.createTransport({
        service: "gmail", // hoặc thay bằng dịch vụ email bạn dùng
        auth: {
            user: process.env.EMAIL_USER, // email gửi
            pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng
        },
    });
    // Nội dung email
    const mailOptions = {
        from: `"StudyHub" <${process.env.EMAIL_USER}>`, // Địa chỉ email gửi
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Đã gửi email tới ${to}`);
    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
        throw error;
    }
};
