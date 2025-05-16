const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Đăng ký tài khoản
router.post("/register", authController.register);
// Đăng nhập
router.post("/login", authController.login);
// Xác thực OTP
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
