const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    courseTag: { type: String },
    subjectTag: { type: String },
    title: { type: String },
    duration: { type: Number, default: 0 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "exercise" }],
    level: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    attemptCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const Exam = mongoose.model("Exam", shema);

module.exports = Exam;
