const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    title: {
        type: String,
    },
    tag: {
        type: String,
    },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
});

const Subject = mongoose.model("Subject", shema);

module.exports = Subject;
