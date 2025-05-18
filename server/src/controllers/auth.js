const User = require("../models/user");
const generator = require("../utils/generator");
const { sendMail } = require("../utils/mailers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
    try {
        const {
            lastName,
            firstName,
            username,
            email,
            password,
            confirmPassword,
        } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (
            !lastName ||
            !firstName ||
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res
                .status(400)
                .json({ message: "Mời nhập thông tin đăng ký" });
        }
        // Kiểm tra mật khẩu và xác nhận mật khẩu
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu không khớp" });
        }
        // Kiểm tra email và username đã tồn tại
        const isEmailInUse = await User.findOne({ email });
        if (isEmailInUse) {
            return res.status(409).json({ message: "Email đã được sử dụng" });
        }
        const isUsernameInUse = await User.findOne({ username });
        if (isUsernameInUse) {
            return res
                .status(409)
                .json({ message: "Tên đăng nhập đã tồn tại" });
        }
        // Tạo user mới với status not_verify
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profile: { lastName, firstName },
            status: "not_verify",
        });
        await newUser.save();
        // Tạo OTP và gửi email
        const otp = generator.generateOTP();
        await sendMail({
            to: email,
            subject: "Mã xác thực",
            html: `<p>Chào bạn,</p><p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Vui lòng nhập mã này để xác thực tài khoản của bạn.</p><p>Trân trọng,</p>`,
        });
        res.status(201).json({
            message:
                "Tạo tài khoản thành công. Mã xác thực đã được gửi về email của bạn.",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Mời nhập thông tin đăng ký" });
        }
        // Tìm người dùng theo username
        const user = await User.findOne({ username });
        if (!user)
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại" });
        // Kiểm tra trạng thái
        if (user.status === "not_verify")
            return res
                .status(403)
                .json({ message: "Tài khoản chưa được xác thực" });
        if (user.status === "locked")
            return res.status(403).json({ message: "Tài khoản đã bị khóa" });

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res
                .status(400)
                .json({ message: "Mật khẩu không chính xác" });
        // Tạo token
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );
        // Thành công
        return res.status(200).json({
            data: {
                token,
                user: { _id: user._id, email: user.email, role: user.role },
            },
            message: "Đăng nhập thành công",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Gửi OTP
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }
        // Kiểm tra email và username đã tồn tại
        const isEmailInUse = await User.findOne({ email });
        if (!isEmailInUse) {
            return res.status(409).json({ message: "Email chưa được đăng ký" });
        }
        // Tạo OTP và gửi email
        const otp = generator.generateOTP();
        await sendMail({
            to: email,
            subject: "Mã xác thực",
            html: `<p>Chào bạn,</p><p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Vui lòng nhập mã này để xác thực tài khoản của bạn.</p><p>Trân trọng,</p>`,
        });
        res.status(201).json({
            otp,
            message:
                "Tạo tài khoản thành công. Mã xác thực đã được gửi về email của bạn.",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Gửi OTP
exports.activeAccount = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }
        // Kiểm tra email và username đã tồn tại
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).json({ message: "Email chưa được đăng ký" });
        }
        // Đổi trang thái tài khoản thành active
        user.status = "active";
        await user.save();
        // Thành công
        res.status(201).json({ message: "Kích hoạt tài khoản thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Gửi mật khẩu mới
exports.sendNewPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }
        // Kiểm tra email và username đã tồn tại
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).json({ message: "Email chưa được đăng ký" });
        }
        // Tạo mật khẩu mới
        const newPassword = generator.generatePassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        // Gửi mật khẩu mới qua email
        await sendMail({
            to: email,
            subject: "Mật khẩu mới",
            html: `<p>Chào bạn,</p><p>Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p><p>Vui lòng đăng nhập và thay đổi mật khẩu sau khi đăng nhập.</p><p>Trân trọng,</p>`,
        });
        res.status(201).json({
            message:
                "Mật khẩu mới đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư đến.",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
