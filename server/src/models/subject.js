const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: { type: String },
    author: { type: String },
    courseId: { type: String },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
});

module.exports = mongoose.model("Subject", schema);
