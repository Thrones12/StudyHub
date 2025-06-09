const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        title: { type: String },
        spentTime: { type: Number, default: 0 }, // Phút
        targetTime: { type: Number, default: 0 }, // Phút
        isDone: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Session", schema);
