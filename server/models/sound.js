const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    name: { type: String },
    icon: { type: String },
    src: { type: String },
});

const Sound = mongoose.model("Sound", shema);

module.exports = Sound;
