const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        name: { type: String },
        order: { type: Number, default: 0 },
        tasks: [
            {
                ID: { type: String },
                title: { type: String },
                description: { type: String },
                status: {
                    type: String,
                    enum: [
                        "pending",
                        "doing",
                        "completed",
                        "review",
                        "canceled",
                        "overdue",
                    ],
                    default: "pending",
                },
                dueDate: { type: Date, default: Date.now },
                endDate: { type: Date, default: Date.now },
                repeat: {
                    type: String,
                    enum: ["none", "daily", "weekly", "monthly", "yearly"],
                    default: "none",
                },
                priority: {
                    type: String,
                    enum: ["low", "medium", "high", "urgent"], // 0: low, 1: medium, 2: high, 3: urgent
                    default: "low",
                },
                steps: [
                    {
                        title: { type: String },
                        done: { type: Boolean, default: false },
                    },
                ],
                completed: { type: Boolean, default: false },
                todo: { type: String },
                order: { type: Number, default: 0 },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Todo", schema);
