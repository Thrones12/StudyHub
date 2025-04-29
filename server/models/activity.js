const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    title: { type: String },
    type: { type: String, enum: ["lesson, exam, comment, like, bookmark"] },
    componentId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Activity = mongoose.model("Activity", shema);

module.exports = Activity;
