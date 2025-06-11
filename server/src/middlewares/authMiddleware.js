// middleware/verifyToken.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Lấy phần sau "Bearer"
    console.log(authHeader);

    if (!token) {
        return res.status(401).json({
            message: "Không có token. Truy cập bị từ chối.",
        });
    }

    try {
        const secretKey = process.env.JWT_SECRET || "your-secret-key"; // nên để trong .env
        const decoded = jwt.verify(token, secretKey);

        req.user = decoded; // Gắn user vào request để route sau có thể dùng
        next(); // Cho phép đi tiếp
    } catch (err) {
        return res.status(403).json({
            message: "Token không hợp lệ hoặc đã hết hạn.",
        });
    }
};

module.exports = verifyToken;
