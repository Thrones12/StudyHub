const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        title: { type: String },
        author: { type: String },
        courseId: { type: String },
        image: {
            type: String,
            default:
                "https://res.cloudinary.com/ds5lvyntx/image/upload/v1749486154/images_mlysti.jpg",
        },
        order: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subject", schema);
