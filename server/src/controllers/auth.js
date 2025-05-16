const User = require("../models/user");
const generator = require("../utils/generator");
const mailer = require("../utils/mailer");

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
    try {
        const { email, password, profile } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Mời nhập email và mật khẩu" });
        }
        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email đã được sử dụng" });
        }
        // Tạo user mới với status not_verify
        const newUser = new User({ email, password, profile });
        await newUser.save();
        // Tạo OTP và gửi email
        const otp = generator.generateOTP();
        await mailer.sendOTP(
            email,
            "Mã xác thực",
            `Mã xác thực của bạn là: ${otp}`
        );
        res.status(201).json({
            message:
                "Tạo tài khoản thành công. Mã xác thực đã được gửi về email của bạn.",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Đăng nhập
exports.login = async (req, res) => {};
// Xác thực OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const valid = await otpService.verifyOTP(user._id, otp);
        if (!valid)
            return res.status(400).json({ message: "Invalid or expired OTP" });
        user.status = "active";
        await user.save();
        res.json({ message: "Account verified successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
