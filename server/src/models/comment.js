const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ref để lấy tên user
    content: { type: String }, // Nội dung comment
    replyTo: { type: mongoose.Schema.Types.ObjectId, default: null }, // comment cha
    likes: [{ type: String }], // Array string chứa userId
    timestamp: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", schema);

module.exports = Comment;
