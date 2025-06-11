const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        title: { type: String },
        subjectId: { type: String },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "lesson" }],
        exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "exam" }],
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Chapter", schema);
