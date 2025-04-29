const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    title: {
        type: String,
    },
    tag: {
        type: String,
    },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
});

const Course = mongoose.model("Course", shema);

module.exports = Course;
