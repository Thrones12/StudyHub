const Comment = require("../models/comment");
const Lesson = require("../models/lesson");

// GET /comment
exports.getAll = async (req, res) => {
    try {
        const { lessonId } = req.query;
        let data = []; // Return data

        // Get data
        let topLevelComments;
        if (lessonId) {
            let lesson = await Lesson.findById(lessonId).populate({
                path: "comments",
                model: "Comment",
                populate: {
                    path: "user",
                    model: "User",
                    select: "profile.fullname profile.avatarUrl",
                },
            });
            topLevelComments = lesson.comments.filter(
                (comment) => comment.replyTo === null
            );
        } else {
            topLevelComments = await Comment.find({
                replyTo: null,
            });
        }
        // 404 - Not Found
        if (!topLevelComments)
            return res.status(404).json({ message: "Data not found" });
        // Get reply của comment
        for (const comment of topLevelComments) {
            const replies = await Comment.find({
                replyTo: comment._id,
            }).populate({
                path: "user",
                model: "User",
                select: "profile.fullname profile.avatarUrl",
            });

            data.push({ ...comment._doc, replies });
        }
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // 200 - Success
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ message: "Server Error: ", err });
    }
};
// GET /comment/get-one?id=...
exports.getOne = async (req, res) => {
    try {
        const { id } = req.query;
        let data; // Return data

        // Get data
        data = await Comment.findById(id);
        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Data not found" });

        // Get replies
        const replies = await Comment.find({ replyTo: id });
        data = { ...data._doc, replies };

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server Error: ", err });
    }
};
// POST /comment
exports.create = async (req, res) => {
    try {
        const { lessonId, user, content, replyTo } = req.body;

        // Create
        const data = new Comment({
            user,
            content,
            replyTo: replyTo || null, // Nếu có replyTo thì dùng, không thì null
        });
        await data.save();

        // Thêm comment vào lesson
        const lesson = await Lesson.findById(lessonId);
        lesson.comments.push(data._id.toString());
        await lesson.save();

        let returnData = await Comment.findById(data._id).populate({
            path: "user",
            model: "User",
        });

        // 200 - Success
        return res.status(200).json({ data: returnData });
    } catch (err) {
        return res.status(500).json({ message: "Server Error: ", err });
    }
};
// PUT /comment
exports.update = async (req, res) => {
    try {
        const { id, content } = req.body;
        console.log(content);

        // Get data
        const data = await Comment.findById(id);
        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Data Not Found" });

        // Update
        if (content) data.content = content;
        await data.save();

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "Server Error: ", err });
    }
};
// PUT /comment/like
exports.likeLesson = async (req, res) => {
    try {
        const { commentId, userId } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json("Data Not Found");

        let isLiked = false;

        // Kiểm tra nếu đã lưu rồi thì xóa khỏi saves, ngược lại thì thêm vào
        const index = comment.likes.indexOf(userId);
        if (index > -1) {
            comment.likes.splice(index, 1);
            isLiked = false;
        } else {
            comment.likes.push(userId);
            isLiked = true;
        }

        await comment.save();

        res.status(200).json({
            comment: comment,
            isLiked,
        });
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};
// DELETE /comment?id=...
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Comment.findByIdAndDelete(id);
        // 404 - Not Found
        if (!data) return res.status(404).json({ message: "Data Not Found" });

        // Xoá comment khỏi comments trong lesson
        const lesson = (await Lesson.find({})).find((lesson) =>
            lesson.comments.some((comment) => comment.toString() === id)
        );
        // 404 - Not Found
        if (!lesson)
            return res.status(404).json({ message: "Lesson Not Found" });
        lesson.comments.pull(id);
        await lesson.save();

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        console.log(err);

        return res.status(500).json({ message: err });
    }
};
