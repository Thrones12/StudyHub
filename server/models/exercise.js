const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    question: { type: String },
    options: [{ type: String }],
    answer: { type: String },
    explanation: { type: String },
});

const Exercise = mongoose.model("Exercise", shema);

module.exports = Exercise;
