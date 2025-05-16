const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "exam" },
    chapterId: { type: String },
    score: { type: Number },
    duration: { type: Number },
    submitAt: { type: Date, default: Date.now },
    result: [
        {
            question: { type: String },
            input: { type: String },
            state: { type: String },
        },
    ],
});

const ExamResult = mongoose.model("ExamResult", shema);

module.exports = ExamResult;
