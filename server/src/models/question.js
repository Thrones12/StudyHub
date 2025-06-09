const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        courseTitle: { type: String },
        subjectTitle: { type: String },
        chapterTitle: { type: String },
        lessonTitle: { type: String },
        content: { type: String },
        options: { type: [String] },
        correctAnswer: { type: String },
        hint: { type: String, default: "" },
        explanation: { type: String, default: "" },
        level: {
            type: String,
            enum: ["Easy", "Medium", "Hard", "Extreme"],
            default: "Easy",
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Question", schema);
