const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    title: { type: String },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "lesson" }],
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "exam" }],
});

const Chapter = mongoose.model("Chapter", shema);

module.exports = Chapter;
