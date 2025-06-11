const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
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
        profile: {
            avatarUrl: {
                type: String,
                default:
                    "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749332122/user-286_kf2bvt.png",
            },
            fullname: {
                type: String,
                default: "",
            },
            gender: {
                type: String,
                enum: ["Male", "Female", "Other"],
                default: "Male",
            },
            address: {
                type: String,
                default: "",
            },
            phone: {
                type: String,
                default: "",
            },
            birthdate: {
                type: Date,
                default: null,
            },
            school: {
                type: String,
                default: "",
            },
            grade: {
                type: String,
                default: "",
            },
            hobby: {
                type: String,
                default: "",
            },
            interests: {
                type: String,
                default: "",
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
                                subjectId: { type: String },
                                second: { type: Number, default: 0 },
                            },
                        ],
                    },
                ],
            },
        ],
        examResults: [
            { type: mongoose.Schema.Types.ObjectId, ref: "ExamResult" },
        ],
        histories: [{ type: String }],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
        saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
        notifications: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
        ],
        customThemes: [{ type: String }],
        todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }],
        sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
        searchs: [
            {
                title: { type: String },
                info: { type: String },
                link: { type: String },
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", schema);
