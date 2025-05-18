const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static file
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);
const notiRouter = require("../routers/notification");
app.use("/api/notification", notiRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
