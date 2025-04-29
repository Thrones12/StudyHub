const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    title: { type: String },
    video: {
        url: { type: String },
        chapters: [{ time: { type: Number }, title: { type: String } }],
    },
    documentUrl: { type: String },
    guideUrl: { type: String },
    exerciseTypes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "exercisetypes" },
    ],
    discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: "discuss" }],
    view: { type: Number },
});

const Lesson = mongoose.model("Lesson", shema);

module.exports = Lesson;
