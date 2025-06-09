const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        userId: { type: String },
        type: {
            type: String,
            enum: ["System", "Reminder", "Comment", "Support"],
            default: "System",
        },
        content: { type: String },
        isRead: { type: Boolean, default: false },
        link: { type: String },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", schema);

module.exports = Notification;
