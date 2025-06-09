const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: { type: String },
    order: { type: Number, default: 0 },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
});

module.exports = mongoose.model("Course", schema);
