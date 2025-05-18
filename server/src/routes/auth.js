const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Đăng ký tài khoản
router.post("/register", authController.register);
// Đăng nhập
router.post("/login", authController.login);
// Gửi OTP
router.post("/send-otp", authController.sendOtp);
// Kích hoạt tài khoản
router.post("/active-account", authController.activeAccount);
// Gửi mật khẩu mới
router.post("/send-new-password", authController.sendNewPassword);

module.exports = router;
