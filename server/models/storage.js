const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    title: { type: String },
    type: { type: String, enum: ["exam", "lesson", "exercise"] },
    items: [{ type: String }],
});

const Storage = mongoose.model("Storage", shema);

module.exports = Storage;
