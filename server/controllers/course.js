const Course = require("../models/course");

// GET /course
const GetData = async (req, res) => {
    // Các query có thể có khi get data
    const { id } = req.query;

    let data; // Biến lưu trữ dữ liệu ban đầu khi get

    // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
    if (id) {
        data = await Course.findById(id);
    } else {
        data = await Course.find({}).populate({
            model: "Subject",
            path: "subjects",
            populate: { path: "chapters", model: "Chapter" },
        });
    }

    // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
    if (!data) return res.status(404).json({ message: "Data not found" });

    return res.status(200).json({ data });
};
// GET /course/get-one?id=...
const GetOne = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id, tag } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await Course.findById(id);
        } else if (tag) {
            data = await Course.findOne({ tag: tag });
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.status(200).json({ data, message: "Get one activity" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
module.exports = {
    GetData,
    GetOne,
};
