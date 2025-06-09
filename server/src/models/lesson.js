const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        title: { type: String },
        chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
        video: {
            url: { type: String },
            chapters: [{ time: { type: Number }, title: { type: String } }],
        },
        document: { type: String },
        exercises: [
            {
                type: { type: String },
                questions: [
                    { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
                ],
            },
        ],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        rating: {
            details: [
                {
                    userId: { type: String },
                    rate: { type: Number },
                    content: { type: String },
                },
            ],
            overall: { type: Number, default: 0 },
        },
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Lesson = mongoose.model("Lesson", schema);

module.exports = Lesson;
