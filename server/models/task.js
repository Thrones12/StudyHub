const mongoose = require("mongoose");

const shema = new mongoose.Schema({
    userId: { type: String },
    title: { type: String },
    loop: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 }, // 0: Không, 1: Hằng ngày , 2: tuần, 3: tháng, 4: năm, 5: all
    description: { type: String },
    date: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", shema);

module.exports = Task;
