const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: { type: String },
    icon: { type: String },
    src: { type: String },
});

module.exports = mongoose.model("Sound", schema);
