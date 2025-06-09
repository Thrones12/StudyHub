const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String },
        title: { type: String },
        question: { type: String },
        answer: { type: String, default: "" },
        isShow: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Support", schema);
