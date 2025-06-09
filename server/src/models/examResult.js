const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        chapterId: { type: String },
        score: { type: Number },
        duration: { type: Number },
        trueCount: { type: Number },
        falseCount: { type: Number },
        notDoneCount: { type: Number },
        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                },
                selectOption: { type: String },
                isCorrect: { type: Boolean, default: false },
            },
        ],
    },
    { timestamps: true }
);

const ExamResult = mongoose.model("ExamResult", schema);

module.exports = ExamResult;
