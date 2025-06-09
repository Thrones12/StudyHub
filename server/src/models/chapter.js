const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: { type: String },
    subjectId: { type: String },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "lesson" }],
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "exam" }],
});

module.exports = mongoose.model("Chapter", schema);
