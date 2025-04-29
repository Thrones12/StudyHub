const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    name: { type: String },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
});

const ExerciseType = mongoose.model("ExerciseType", shema);

module.exports = ExerciseType;
