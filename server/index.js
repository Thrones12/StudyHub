let express = require("express");
let cors = require("cors");
let mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
let app = express();

// Cho phép FE và BE listen các port khác nhau
app.use(cors());

// Middleware để phân tích dữ liệu form (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
// Middleware để phân tích dữ liệu JSON
app.use(express.json());
// Cấu hình express để phục vụ tệp tĩnh từ thư mục 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Kết nối tới MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

// Thêm các API của web
let api = require("./api/api");
app.use(api);

// Xử lý lỗi 404 cho các route không tồn tại
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Chạy server
let port = process.env.PORT || 8088;
app.listen(port, () => {
    console.log(`Server start on port: ${port}`);
});
