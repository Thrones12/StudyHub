const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    avatar: { type: String, default: "/images/profile.png" },
    fullname: { type: String, default: "Người dùng" },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student",
    },
    otp: { type: String },
    status: { type: String, enum: ["active", "locked"] },
    learned: [
        {
            courseId: { type: String },
            subjects: [
                {
                    subjectId: { type: String },
                    lessons: [
                        {
                            lessonId: { type: String },
                            isDone: { type: Boolean, default: false },
                        },
                    ],
                },
            ],
        },
    ],
    examResults: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExamResult" }],
    histories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    storages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Storage" }],
    notifications: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

const User = mongoose.model("User", shema);

module.exports = User;
