const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    message: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});

const Discuss = mongoose.model("Discuss", shema);

module.exports = Discuss;
