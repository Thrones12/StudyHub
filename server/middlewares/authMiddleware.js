const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Không có token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ← Gắn thông tin user vào request để dùng tiếp
        next(); // Tiếp tục đi đến controller
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token đã hết hạn" });
        }
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};

module.exports = verifyToken;
