const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "subject" },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "lesson" }],
});

const Enrolled = mongoose.model("Enrolled", shema);

module.exports = Enrolled;
