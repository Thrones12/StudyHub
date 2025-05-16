const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // hoặc thay bằng dịch vụ email bạn dùng
    auth: {
        user: process.env.EMAIL_USER, // email gửi
        pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng
    },
});

function sendMail({ to, subject, html }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };
    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendMail,
};
