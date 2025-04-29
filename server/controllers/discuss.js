const Discuss = require("../models/discuss");
const lesson = require("../models/lesson");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Discuss.findById(id);
    } else {
        data = await Discuss.find({}).populate({ model: "User", path: "user" });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "Discuss not found" });

    console.log("Get Discuss: \n" + data);
    res.json(data);
};

const Create = async (req, res) => {
    try {
        const { lessonId, userId, message } = req.body;

        // Kiểm tra nếu thiếu dữ liệu
        if (!lessonId || !userId || !message.trim()) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Tạo Discuss mới
        const newDiscuss = new Discuss({
            user: userId,
            message,
            likes: [],
        });

        // Lưu Discuss vào database
        await newDiscuss.save();

        // Cập nhật lesson, thêm Discuss vào Discussions của lesson
        const lessonItem = await lesson.findById(lessonId);
        lessonItem.discussions = [...lessonItem.discussions, newDiscuss];

        await lessonItem.save();

        res.status(201).json({
            message: "Discuss created successfully",
            discuss: newDiscuss,
            lesson: lessonItem,
        });
    } catch (error) {
        console.error("Error creating Discuss:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const Like = async (req, res) => {
    try {
        const { userId } = req.body; // Lấy userId từ body
        const { id } = req.params; // Lấy DiscussId từ params

        // Cập nhật Discuss bằng cách xóa userId khỏi likes
        const DiscussItem = await Discuss.findById(id);
        if (!DiscussItem) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        // Lọc mảng likes
        DiscussItem.likes = [...DiscussItem.likes, userId];

        // Lưu lại
        await DiscussItem.save();

        res.json({
            message: "Like removed successfully",
            data: DiscussItem,
        });
    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const Unlike = async (req, res) => {
    try {
        const { userId } = req.body; // Lấy userId từ body
        const { id } = req.params; // Lấy DiscussId từ params

        // Cập nhật Discuss bằng cách xóa userId khỏi likes
        const DiscussItem = await Discuss.findById(id);
        if (!DiscussItem) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        // Lọc mảng likes
        DiscussItem.likes = DiscussItem.likes.filter(
            (like) => like.toString() !== userId
        );

        // Lưu lại
        await DiscussItem.save();

        res.json({
            message: "Like removed successfully",
            data: DiscussItem,
        });
    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ message: "Server error" });
    }
};
module.exports = {
    GetData,
    Create,
    Like,
    Unlike,
};
