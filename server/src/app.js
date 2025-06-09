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

const courseRouter = require("./routes/course");
app.use("/api/course", courseRouter);

const subjectRouter = require("./routes/subject");
app.use("/api/subject", subjectRouter);

const chapterRouter = require("./routes/chapter");
app.use("/api/chapter", chapterRouter);

const lessonRouter = require("./routes/lesson");
app.use("/api/lesson", lessonRouter);

const examRouter = require("./routes/exam");
app.use("/api/exam", examRouter);

const examResultRouter = require("./routes/examResult");
app.use("/api/examResult", examResultRouter);

const themeRouter = require("./routes/theme");
app.use("/api/theme", themeRouter);

const todoRouter = require("./routes/todo");
app.use("/api/todo", todoRouter);

const sessionRouter = require("./routes/session");
app.use("/api/session", sessionRouter);

const soundRouter = require("./routes/sound");
app.use("/api/sound", soundRouter);

const notificationRouter = require("./routes/notification");
app.use("/api/notification", notificationRouter);

const supportRouter = require("./routes/support");
app.use("/api/support", supportRouter);

const questionRouter = require("./routes/question");
app.use("/api/question", questionRouter);

const commentRouter = require("./routes/comment");
app.use("/api/comment", commentRouter);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
