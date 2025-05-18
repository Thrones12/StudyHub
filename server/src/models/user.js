const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["active", "locked", "not_verify"],
        default: "not_verify",
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    profile: {
        avatarUrl: {
            type: String,
            default: "",
        },
        lastname: {
            type: String,
            default: "",
        },
        firstname: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
        birthdate: {
            type: Date,
            default: null,
        },
    },
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
    learningHour: [
        {
            time: { type: Date },
            courses: [
                {
                    courseId: { type: String },
                    subjects: [
                        {
                            link: { type: String },
                            subjectTitle: { type: String },
                            second: { type: Number, default: 0 },
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

module.exports = mongoose.model("User", shema);
