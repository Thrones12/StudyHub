const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình Multer để lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/avatars");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Tạo tên file ngẫu nhiên và giữ nguyên đuôi mở rộng của file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// Khởi tạo middleware upload
const upload = multer({ storage });

module.exports = { upload };
