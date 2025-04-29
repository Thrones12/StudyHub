const subject = require("../models/subject");

const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id, tag } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await subject.findById(id).populate({
            model: "Chapter",
            path: "chapters",
            populate: {
                model: "Lesson",
                path: "lessons",
                populate: {
                    model: "Discuss",
                    path: "discussions",
                    populate: { model: "User", path: "user" },
                },
            },
        });
    } else if (tag) {
        data = await subject.find({ tag: tag }).populate({
            model: "Chapter",
            path: "chapters",
            populate: {
                model: "Lesson",
                path: "lessons",
                populate: {
                    model: "Discuss",
                    path: "discussions",
                    populate: { model: "User", path: "user" },
                },
            },
        });
    } else {
        data = await subject.find({}).populate({
            model: "Chapter",
            path: "chapters",
            populate: {
                model: "Lesson",
                path: "lessons",
                populate: {
                    model: "Discuss",
                    path: "discussions",
                    populate: { model: "User", path: "user" },
                },
            },
        });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "subject not found" });

    res.json(data);
};

const GetOne = async (req, res) => {
    // Các query có thể có khi get data
    const { id, tag } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await subject.findOne({ _id: id }).populate({
            model: "Chapter",
            path: "chapters",
            populate: {
                model: "Lesson",
                path: "lessons",
                populate: {
                    model: "Discuss",
                    path: "discussions",
                    populate: { model: "User", path: "user" },
                },
            },
        });
    } else if (tag) {
        data = await subject.findOne({ tag: tag }).populate({
            model: "Chapter",
            path: "chapters",
            populate: {
                model: "Lesson",
                path: "lessons",
                populate: {
                    model: "Discuss",
                    path: "discussions",
                    populate: { model: "User", path: "user" },
                },
            },
        });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "subject not found" });

    return res.status(200).json({ data: data, message: "Get one thành công" });
};

module.exports = {
    GetData,
    GetOne,
};
