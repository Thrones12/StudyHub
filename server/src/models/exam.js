const { duration } = require("@mui/material");
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        title: { type: String, require: true },
        author: { type: String, default: "StudyHub" },
        chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
        duration: { type: Number, default: 0 }, // Giây
        level: {
            type: String,
            enum: ["Easy", "Medium", "Hard", "Extreme"],
            default: "Easy",
        },
        questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
        attemps: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        rating: {
            details: [{ userId: { type: String }, rate: { type: Number } }],
            overall: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Exam", schema);
