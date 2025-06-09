const multer = require("multer");

const storage = multer.memoryStorage(); // dùng memory vì ta không lưu file local
const upload = multer({ storage });

module.exports = upload;
