const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    userId: { type: String },
    type: {
        type: String,
        enum: ["system", "reminder", "lesson", "exam", "exercise"],
        default: "system",
    },
    content: { type: String },
    isRead: { type: Boolean, default: false },
    isShow: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    link: { type: String },
});

const Notification = mongoose.model("Notification", shema);

module.exports = Notification;
